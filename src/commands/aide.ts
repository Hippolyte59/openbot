import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { asBotClient } from "../types.js";
import { createEmbed } from "../utils/embeds.js";
import { config } from "../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("aide")
    .setDescription("📖 Affiche la liste de toutes les commandes"),

  async execute(interaction) {
    const commands = [...asBotClient(interaction.client).commands.values()];

    const embed = createEmbed()
      .setTitle(`📖 Commandes de ${config.botName}`)
      .setDescription(
        [
          `Bienvenue ! ${config.botName} est un bot **open source** avec économie, niveaux et mini-jeux.`,
          "",
          "Voici toutes les commandes disponibles :",
        ].join("\n"),
      );

    for (const command of commands) {
      embed.addFields({
        name: `\`/${command.data.name}\``,
        value: command.data.description,
        inline: true,
      });
    }

    embed.addFields({
      name: "🛠️ Open source",
      value:
        "Ce bot est libre et gratuit. Récupère le code, personnalise-le et partage tes améliorations !",
    });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
