import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Client } from "discord.js";
import { asBotClient } from "../types.js";
import { config } from "../config.js";
import { renderWiki } from "./wiki.js";
import { renderHome } from "./home.js";
import { LOGO_SVG } from "./logo.js";
import { loadGuilds, saveGuilds, type GuildConfig } from "../database/json-db.js";
import { renderAdmin } from "./admin.js";

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
    send(response, 200, renderAdmin(client), "text/html");
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
          if (data.welcomeBanner !== undefined) updates.welcomeBanner = data.welcomeBanner;
          if (data.goodbyeChannel !== undefined) updates.goodbyeChannel = data.goodbyeChannel;
          if (data.goodbyeMessage !== undefined) updates.goodbyeMessage = data.goodbyeMessage;
          if (data.goodbyeBanner !== undefined) (updates as any).goodbyeBanner = data.goodbyeBanner;
          if (data.embedColor !== undefined) (updates as any).embedColor = data.embedColor;
          if (data.levelColor !== undefined) (updates as any).levelColor = data.levelColor;
          if (data.economyColor !== undefined) (updates as any).economyColor = data.economyColor;
          if (data.maxLevel !== undefined) (updates as any).maxLevel = Number(data.maxLevel) || 100;
          if (data.maxLevelRoleId !== undefined) (updates as any).maxLevelRoleId = data.maxLevelRoleId;
          if (data.privilegedRoleId !== undefined) (updates as any).privilegedRoleId = data.privilegedRoleId;
          if (data.privilegedChannelId !== undefined) (updates as any).privilegedChannelId = data.privilegedChannelId;
          if (data.birthdayRoleId !== undefined) (updates as any).birthdayRoleId = data.birthdayRoleId;
          if (data.birthdayChannelId !== undefined) (updates as any).birthdayChannelId = data.birthdayChannelId;
          if (data.birthdayMessage !== undefined) (updates as any).birthdayMessage = data.birthdayMessage;
          if (data.logs !== undefined) (updates as any).logs = data.logs;
          if (data.autoRoles !== undefined) (updates as any).autoRoles = data.autoRoles;
          if (data.customCommands !== undefined) (updates as any).customCommands = data.customCommands;
          if (data.reactionRoles !== undefined) (updates as any).reactionRoles = data.reactionRoles;
          if (data.wordReactions !== undefined) (updates as any).wordReactions = data.wordReactions;
          if (data.automod !== undefined) (updates as any).automod = data.automod;
          
          const guilds = loadGuilds();
          if (!guilds.has(guildId)) guilds.set(guildId, {} as GuildConfig);
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

  server.on("error", async (error: any) => {
    if (error?.code === "EADDRINUSE") {
      console.error(`❌ Port ${config.webPort} déjà utilisé — libération...`);
      try {
        const { execSync } = await import("node:child_process");
        execSync(`npx --yes kill-port ${config.webPort}`, { stdio: "ignore" });
        setTimeout(() => server.listen(config.webPort), 800);
        return;
      } catch {}
    }
    console.error("❌ Serveur web :", error.message);
  });

  server.listen(config.webPort, () => {
    console.log(`🌐 Site et wiki disponibles sur ${config.publicUrl} (port ${config.webPort})`);
    console.log(`🛠️ Panneau admin : http://localhost:${config.webPort}/admin`);
  });
}