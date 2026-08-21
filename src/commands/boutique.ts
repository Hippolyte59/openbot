import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { SHOP_ITEMS } from "../data/items.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("boutique")
    .setDescription("🛒 Affiche la boutique du serveur"),

  async execute(interaction) {
    const embed = createEmbed()
      .setTitle("🛒 Boutique")
      .setDescription(
        [
          "Bienvenue dans la boutique ! Achète des objets avec tes pièces.",
          "",
          "**Objets disponibles :**",
          ...SHOP_ITEMS.map(
            (item) =>
              `${item.emoji} **${item.name}** — ${formatNumber(item.price)} ${config.currency}\n> ${item.description}`,
          ),
          "",
          `💡 Utilise \`/acheter\` pour faire ton choix.`,
        ].join("\n"),
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
