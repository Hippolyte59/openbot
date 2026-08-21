import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { asBotClient } from "./types.js";
import { loadCommands } from "./loaders.js";
import * as readyEvent from "./events/ready.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";
import * as messageCreateEvent from "./events/messageCreate.js";
import * as voiceStateUpdateEvent from "./events/voiceStateUpdate.js";
import * as channelDeleteEvent from "./events/channelDelete.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

asBotClient(client).commands = new Collection();
await loadCommands(asBotClient(client).commands);

client.once(readyEvent.name, () => readyEvent.execute(client));
client.on(
  interactionCreateEvent.name,
  async (...args) => void interactionCreateEvent.execute(...args),
);
client.on(
  messageCreateEvent.name,
  async (...args) => void messageCreateEvent.execute(...args),
);
client.on(
  voiceStateUpdateEvent.name,
  async (...args) => void voiceStateUpdateEvent.execute(...args),
);
client.on(
  channelDeleteEvent.name,
  async (...args) => void channelDeleteEvent.execute(...args),
);

process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée :", error);
});

console.log(`🚀 Démarrage de ${config.botName}…`);
await client.login(config.token);
