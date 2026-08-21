import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { asBotClient } from "./types.js";
import { loadCommands } from "./loaders.js";
import * as readyEvent from "./events/ready.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";
import * as messageCreateEvent from "./events/messageCreate.js";

// ── Création du client ───────────────────────────────────────────────────────
// MessageContent est un intent "privilégié" : pense à l'activer sur
// https://discord.com/developers/applications > Bot > Privileged Gateway Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Chargement des commandes slash ───────────────────────────────────────────
asBotClient(client).commands = new Collection();
await loadCommands(asBotClient(client).commands);

// ── Enregistrement des événements ────────────────────────────────────────────
client.once(readyEvent.name, () => readyEvent.execute(client));
client.on(
  interactionCreateEvent.name,
  async (...args) => void interactionCreateEvent.execute(...args),
);
client.on(
  messageCreateEvent.name,
  async (...args) => void messageCreateEvent.execute(...args),
);

process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée :", error);
});

// ── Connexion ────────────────────────────────────────────────────────────────
console.log(`🚀 Démarrage de ${config.botName}…`);
await client.login(config.token);
