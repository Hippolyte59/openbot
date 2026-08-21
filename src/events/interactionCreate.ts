import { Events, type Interaction } from "discord.js";
import { asBotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import { handleVocalModal } from "../systems/vocal.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction): Promise<void> {
  // Modales du panneau vocal (places / renommage)
  if (interaction.isModalSubmit()) {
    try {
      await handleVocalModal(interaction);
    } catch (error) {
      console.error("❌ Erreur dans une modale :", error);
      const payload = {
        embeds: [errorEmbed("Une erreur est survenue.")],
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = asBotClient(interaction.client).commands.get(
    interaction.commandName,
  );
  if (!command) {
    console.warn(`⚠️  Commande inconnue reçue : /${interaction.commandName}`);
    return;
  }

  // Toutes les commandes sont liées aux données d'un serveur
  if (!interaction.inGuild()) {
    await interaction.reply({
      embeds: [errorEmbed("Cette commande doit être utilisée dans un serveur.")],
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erreur dans /${interaction.commandName} :`, error);

    const payload = {
      embeds: [
        errorEmbed("Une erreur est survenue en exécutant cette commande."),
      ],
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}
