import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { SHOP_ITEMS } from "../data/items.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("boutique")
    .setDescription("🛒 Affiche la boutique du serveur"),

  async execute(interaction) {
    const consumables = SHOP_ITEMS.filter(
      (item) => item.kind === "consumable",
    );
    const equipment = SHOP_ITEMS.filter((item) => item.kind !== "consumable");

    const embed = createEmbed()
      .setTitle("🛒 Boutique")
      .setDescription(
        [
          "Bienvenue dans la boutique ! Achète des objets avec tes pièces.",
          "",
          "**📦 Consommables**",
          ...consumables.map(
            (item) =>
              `${item.emoji} **${item.name}** — ${formatNumber(item.price)} ${config.currency}\n> ${item.description}`,
          ),
          "",
          "**⚔️ Équipement** (équipé automatiquement à l'achat)",
          ...equipment.map(
            (item) =>
              `${item.emoji} **${item.name}** — ${formatNumber(item.price)} ${config.currency}\n> ${item.description}`,
          ),
          "",
          "💡 Utilise `/acheter` pour faire ton choix.",
        ].join("\n"),
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
