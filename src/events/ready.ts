import { Events, ActivityType, type Client } from "discord.js";
import { config } from "../config.js";
import { startWebServer } from "../web/server.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client): void {
  console.log(`🤖 Connecté en tant que ${client.user?.tag}`);
  console.log(`🌐 Présent sur ${client.guilds.cache.size} serveur(s).`);

  client.user?.setActivity({
    name: "/wiki • open source",
    type: ActivityType.Watching,
  });

  // Serveur web intégré : page wiki + API JSON
  startWebServer(client);
}
