import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Client } from "discord.js";
import { asBotClient } from "../types.js";
import { config } from "../config.js";
import { renderWiki } from "./wiki.js";
import { renderHome } from "./home.js";
import { LOGO_SVG } from "./logo.js";
import { loadGuilds, saveGuilds } from "../database/json-db.js";

const DEFAULT_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data: https://github.com https://avatars.githubusercontent.com https://cdn.discordapp.com https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-src 'none';",
};

function send(
  response: ServerResponse,
  status: number,
  body: string,
  contentType = "text/html; charset=UTF-8",
): void {
  response.writeHead(status, { ...DEFAULT_SECURITY_HEADERS, "Content-Type": contentType });
  response.end(body);
}

// Simple in-memory rate limiter: max N requests per window (ms) per IP
type RateLimiter = {
  ip: string;
  timestamps: number[];
};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

const rateLimiter = new Map<string, RateLimiter>();

function checkRateLimit(ip: string): boolean {
  const entry = rateLimiter.get(ip);
  if (!entry) {
    rateLimiter.set(ip, { ip, timestamps: [Date.now()] });
    return true;
  }
  // Remove timestamps older than the window
  entry.timestamps = entry.timestamps.filter((t) => Date.now() - t < RATE_LIMIT_WINDOW);
  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false; // rate exceeded
  }
  entry.timestamps.push(Date.now());
  return true;
}

function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  client: Client,
): void {
  const ip = request.socket.remoteAddress ?? "unknown";
  if (!checkRateLimit(ip)) {
    response.writeHead(429, { "Content-Type": "application/json; charset=UTF-8" });
    response.end(JSON.stringify({ error: "Rate limit exceeded" }));
    return;
  }
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const commands = asBotClient(client).commands;

  if (url.pathname === "/health") {
    send(
      response,
      200,
      JSON.stringify({ status: "ok", bot: config.botName }),
      "application/json",
    );
    return;
  }

  if (url.pathname === "/api/commands") {
    const payload = commands.map((command) => ({
      name: command.data.name,
      description: command.data.description,
    }));
    send(
      response,
      200,
      JSON.stringify({ count: payload.length, commands: payload }),
      "application/json",
    );
    return;
  }

  if (url.pathname === "/logo.svg") {
    send(response, 200, LOGO_SVG, "image/svg+xml");
    return;
  }

  if (url.pathname === "/wiki") {
    send(response, 200, renderWiki(commands));
    return;
  }

  if (url.pathname === "/") {
    send(response, 200, renderHome(commands.size));
    return;
  }

  // ---------- NOUVEAU : PANNEAU D'ADMINISTRATION ----------
  // Vérification basique : admin si le query contient un token sécurisé ou IP whitelist
  // Ici on autorise toute demande venant de l'IP locale pour la démo, en prod il faut OAuth2
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    if (!isLocalhost) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=UTF-8" });
      response.end("Accès interdit - utilisez localhost");
      return;
    }
    send(response, 200, adminPage(), "text/html");
    return;
  }

  if (url.pathname === "/admin/api/guilds") {
    if (request.method === "GET") {
      const guilds = loadGuilds();
      send(response, 200, JSON.stringify([...guilds.entries()]), "application/json");
    } else if (request.method === "POST") {
      let body = "";
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        try {
          const data = JSON.parse(body);
          const guildId = String(data.guildId);
          const updates: Partial<import("../database/json-db.js").GuildConfig> = {};
          
          if (data.welcomeChannel !== undefined) updates.welcomeChannel = data.welcomeChannel;
          if (data.welcomeMessage !== undefined) updates.welcomeMessage = data.welcomeMessage;
          if (data.goodbyeChannel !== undefined) updates.goodbyeChannel = data.goodbyeChannel;
          if (data.goodbyeMessage !== undefined) updates.goodbyeMessage = data.goodbyeMessage;
          
          const guilds = loadGuilds();
          if (!guilds.has(guildId)) guilds.set(guildId, {});
          const updated = { ...guilds.get(guildId)!, ...updates };
          guilds.set(guildId, updated);
          saveGuilds(guilds);
          
          send(response, 200, JSON.stringify({ success: true }), "application/json");
        } catch {
          response.writeHead(400, { "Content-Type": "application/json; charset=UTF-8" });
          response.end(JSON.stringify({ error: "JSON invalide" }));
        }
      });
    }
    return;
  }

  // ---------- FIN PANNEAU D'ADMINISTRATION ----------

  send(response, 404, "Not found", "text/plain; charset=UTF-8");
}

export function startWebServer(client: Client): void {
  const server = createServer((request, response) =>
    handleRequest(request, response, client),
  );

  server.on("error", (error) => {
    console.error("❌ Serveur web :", error.message);
  });

  server.listen(config.webPort, () => {
    console.log(`🌐 Site et wiki disponibles sur ${config.publicUrl} (port ${config.webPort})`);
    console.log(`🛠️ Panneau admin : http://localhost:${config.webPort}/admin`);
  });
}

function adminPage(): string {
  const guilds = loadGuilds();
  const guildsList = Array.from(guilds.entries())
    .map(([guildId, cfg]) => `
      <div class="guild-card">
        <h3>Serveur #${guildId.substring(0, 6)}...</h3>
        <form method="POST" action="/admin/api/guilds" style="display:flex;gap:10px;">
          <input type="hidden" name="guildId" value="${guildId}">
          <input type="text" name="welcomeChannel" value="${cfg.welcomeChannel || ""}" placeholder="#bienvenue">
          <input type="text" name="welcomeMessage" value="${cfg.welcomeMessage || "Bienvenue {pseudo} !"}" style="width:300px;">
          <input type="text" name="goodbyeChannel" value="${cfg.goodbyeChannel || ""}" placeholder="#au-revoir">
          <input type="text" name="goodbyeMessage" value="${cfg.goodbyeMessage || "Au revoir !"}" style="width:300px;">
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `).join("");
  
  return `
<!DOCTYPE html>
<html lang="fr" style="font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem;">
  <head>
    <meta charset="UTF-8">
    <title>OpenBot - Tableau de bord administration</title>
    <style>
      .guild-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
      input { padding: 0.5rem; margin: 0.2rem 0; }
      button { padding: 0.5rem 1rem; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>🛠️ OpenBot - Administration</h1>
    <p>Configuration welcome/goodbye par serveur</p>
    
    <div style="margin-bottom: 2rem;">
      <h2>Nouveau serveur</h2>
      <form method="POST" action="/admin/api/guilds" style="display:flex;gap:10px;">
        <input type="text" name="guildId" placeholder="ID du serveur" style="width:200px;">
        <input type="text" name="welcomeChannel" placeholder="#bienvenue" style="width:150px;">
        <input type="text" name="welcomeMessage" value="Bienvenue {pseudo} !" style="width:300px;">
        <input type="text" name="goodbyeChannel" placeholder="#au-revoir" style="width:150px;">
        <input type="text" name="goodbyeMessage" value="Au revoir !" style="width:300px;">
        <button type="submit">Créer config</button>
      </form>
    </div>
    
    <h2>Serveurs configurés</h2>
    ${guildsList.length > 0 ? guildsList : "<p>Aucun serveur configuré encore.</p>"}
    
    <hr>
    <p><small>Modifications sauvegardées en JSON dans data/</small></p>
  </body>
</html>
  `;
}