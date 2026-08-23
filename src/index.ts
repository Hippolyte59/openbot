import { Events, Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { startWebServer } from "./web/server.js";
import { loadCommands } from "./loaders.js";
import { loadEvents } from "./loaders.js";
import { setupDatabase } from "./database.js";

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessageReactions,
].filter(Boolean);

export const client = new Client({ intents: intents as any });

client.commands = new Map();

(async () => {
  try {
    await setupDatabase();

    // Charger les commandes
    const commands = await loadCommands(client.commands as any);
    console.log(`📦 ${commands.length} commande(s) chargée(s)`);

    // Charger les événements
    const eventsMap = new Map([
      ["ready", { name: Events.ClientReady, once: true, execute: async (client: Client) => {
        const { execute: readyExecute } = await import("./events/ready.ts");
        readyExecute(client);
      }}],
      ["interactionCreate", { name: Events.InteractionCreate, execute: async (interaction: import("discord.js").Interaction) => {
        const { execute: interactionExecute } = await import("./events/interactionCreate.ts");
        interactionExecute(interaction);
      }}],
      ["guildMemberAdd", { name: Events.GuildMemberAdd, execute: async (member: import("discord.js").GuildMember) => {
        const { execute: guildMemberAddExecute } = await import("./events/guildMemberAdd.ts");
        await guildMemberAddExecute(member);
      }}],
      ["guildMemberRemove", { name: Events.GuildMemberRemove, execute: async (member: import("discord.js").GuildMember) => {
        const { execute: guildMemberRemoveExecute } = await import("./events/guildMemberRemove.ts");
        await guildMemberRemoveExecute(member);
      }}],
    ]);

    loadEvents(client, eventsMap);

    console.log("✅ Initialisation terminée");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation :", err);
    process.exit(1);
  }
})();