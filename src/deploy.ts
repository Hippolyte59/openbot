
import * as pkg from "discord.js";
const { Collection, REST, Routes } = pkg as any;
import { config } from "./config.js";
import { loadCommands } from "./loaders.js";

const rest = new (REST as any)().setToken(config.token);

let applicationId = config.clientId;
if (!applicationId) {
  const app = (await rest.get(Routes.oauth2CurrentApplication())) as {
    id: string;
  };
  applicationId = app.id;
  console.log(` CLIENT_ID déduit automatiquement : ${applicationId}`);
}

const commands = await loadCommands(new (Collection as any)());
const body = commands.map((command) => command.toJSON());

try {
  if (config.guildId) {
    const route = Routes.applicationGuildCommands(applicationId, config.guildId);
    await rest.put(route, { body });
    console.log(
      `${body.length} commande(s) déployée(s) sur le serveur de test (${config.guildId}).`,
    );
  } else {
    const route = Routes.applicationCommands(applicationId);
    await rest.put(route, { body });
    console.log(
      `${body.length} commande(s) déployée(s) globalement (jusqu'à 1 h de propagation).`,
    );
  }
} catch (error) {
  console.error("Échec du déploiement des commandes :", error);
  process.exitCode = 1;
}
