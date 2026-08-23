import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { asBotClient } from "./types.js";
import { loadCommands } from "./loaders.js";
import * as readyEvent from "./events/ready.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";
import * as messageCreateEvent from "./events/messageCreate.js";
import * as voiceStateUpdateEvent from "./events/voiceStateUpdate.js";
import * as channelDeleteEvent from "./events/channelDelete.js";
import * as guildMemberAddEvent from "./events/guildMemberAdd.js";
import * as guildMemberRemoveEvent from "./events/guildMemberRemove.js";
import { initScheduler } from "./systems/scheduler.js";

const client = new (Client as any)({
  intents: [
    (GatewayIntentBits as any).Guilds,
    (GatewayIntentBits as any).GuildMessages,
    (GatewayIntentBits as any).MessageContent,
    (GatewayIntentBits as any).GuildVoiceStates,
    (GatewayIntentBits as any).GuildMembers,
  ],
});

asBotClient(client).commands = new (Collection as any)();
await loadCommands(asBotClient(client).commands);
initScheduler(client as any);

client.once(readyEvent.name, () => (readyEvent.execute as any)(client));
client.on(interactionCreateEvent.name, (...args: any[]) => void (interactionCreateEvent.execute as any)(...args));
client.on(messageCreateEvent.name, (...args: any[]) => void (messageCreateEvent.execute as any)(...args));
client.on(voiceStateUpdateEvent.name, (...args: any[]) => void (voiceStateUpdateEvent.execute as any)(...args));
client.on(channelDeleteEvent.name, (...args: any[]) => void (channelDeleteEvent.execute as any)(...args));
client.on(guildMemberAddEvent.name, (...args: any[]) => void (guildMemberAddEvent.execute as any)(...args));
client.on(guildMemberRemoveEvent.name, (...args: any[]) => void (guildMemberRemoveEvent.execute as any)(...args));

process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée :", error);
});

console.log(`🚀 Démarrage de ${config.botName}…`);
await client.login(config.token);
