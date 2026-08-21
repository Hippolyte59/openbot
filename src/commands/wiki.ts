import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { config } from "../config.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("wiki")
    .setDescription("📖 Ouvre le wiki (documentation complète du bot)"),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        createEmbed()
          .setTitle("📖 Wiki")
          .setDescription(
            [
              `Toute la documentation est disponible en ligne :`,
              "",
              `**${config.publicUrl}/wiki**`,
              "",
              "Tu y trouveras toutes les commandes classées par catégorie,",
              "copiables en un clic, ainsi que le guide d'installation.",
            ].join("\n"),
          ),
      ],
    });
  },
} satisfies Command;
