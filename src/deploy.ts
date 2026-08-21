/**
 * Déploie les commandes slash sur Discord.
 *
 * Usage : npm run deploy
 * - Si GUILD_ID est défini dans .env : déploie instantanément sur ce serveur (idéal en dev).
 * - Sinon : déploiement global (peut prendre jusqu'à ~1 h pour apparaître partout).
 */
import { Collection, REST, Routes } from "discord.js";
import { config } from "./config.js";
import { loadCommands } from "./loaders.js";

const rest = new REST().setToken(config.token);

// Si CLIENT_ID n'est pas renseigné, on le récupère automatiquement via l'API
let applicationId = config.clientId;
if (!applicationId) {
  const app = (await rest.get(Routes.oauth2CurrentApplication())) as {
    id: string;
  };
  applicationId = app.id;
  console.log(`ℹ️  CLIENT_ID déduit automatiquement : ${applicationId}`);
}

const commands = await loadCommands(new Collection());
const body = commands.map((command) => command.toJSON());

try {
  if (config.guildId) {
    const route = Routes.applicationGuildCommands(applicationId, config.guildId);
    await rest.put(route, { body });
    console.log(
      `✅ ${body.length} commande(s) déployée(s) sur le serveur de test (${config.guildId}).`,
    );
  } else {
    const route = Routes.applicationCommands(applicationId);
    await rest.put(route, { body });
    console.log(
      `✅ ${body.length} commande(s) déployée(s) globalement (jusqu'à 1 h de propagation).`,
    );
  }
} catch (error) {
  console.error("❌ Échec du déploiement des commandes :", error);
  process.exitCode = 1;
}
