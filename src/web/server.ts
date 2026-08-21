import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Client } from "discord.js";
import { asBotClient } from "../types.js";
import { config } from "../config.js";
import { renderWiki } from "./wiki.js";

function send(
  response: ServerResponse,
  status: number,
  body: string,
  contentType = "text/html; charset=UTF-8",
): void {
  response.writeHead(status, { "Content-Type": contentType });
  response.end(body);
}

/** Répond aux requêtes du serveur web intégré. */
function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  client: Client,
): void {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/health") {
    send(response, 200, JSON.stringify({ status: "ok", bot: config.botName }), "application/json");
    return;
  }

  if (url.pathname === "/api/commands") {
    const commands = asBotClient(client).commands;
    const payload = commands.map((command) => ({
      name: command.data.name,
      description: command.data.description,
    }));
    send(response, 200, JSON.stringify({ count: payload.length, commands: payload }), "application/json");
    return;
  }

  if (url.pathname === "/" || url.pathname === "/wiki") {
    // Régénérée à chaque requête : la page reste toujours à jour
    const html = renderWiki(asBotClient(client).commands);
    send(response, 200, html);
    return;
  }

  send(response, 404, "Not found", "text/plain; charset=UTF-8");
}

/** Démarre le serveur web (wiki + API). */
export function startWebServer(client: Client): void {
  const server = createServer((request, response) =>
    handleRequest(request, response, client),
  );

  server.on("error", (error) => {
    console.error("❌ Serveur web :", error.message);
  });

  server.listen(config.webPort, () => {
    console.log(`🌐 Wiki disponible sur ${config.publicUrl} (port ${config.webPort})`);
  });
}
