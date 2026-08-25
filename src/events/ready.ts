import * as pkg from "discord.js";
const { Events, ActivityType } = pkg as any;
import type { Client } from "discord.js";
import { config } from "../config.js";
import { startWebServer } from "../web/server.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client): void {
  console.log(`Connecté en tant que ${client.user?.tag}`);
  console.log(`Présent sur ${client.guilds.cache.size} serveur(s).`);

  client.user?.setActivity({
    name: "/aide • open source",
    type: ActivityType.Watching,
  });

  startWebServer(client);
}
