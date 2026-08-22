import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Client } from "discord.js";
import { asBotClient } from "../types.js";
import { config } from "../config.js";
import { renderWiki } from "./wiki.js";
import { renderHome } from "./home.js";
import { LOGO_SVG } from "./logo.js";

const DEFAULT_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; frame-src 'none';",
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

function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  client: Client,
): void {
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
  });
}
