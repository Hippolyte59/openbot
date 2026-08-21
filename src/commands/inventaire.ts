import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getInventory } from "../database/inventory.js";
import { getShopItem } from "../data/items.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";
import { getPlayer } from "../database/players.js";

export default {
  data: new SlashCommandBuilder()
    .setName("inventaire")
    .setDescription("🎒 Affiche ton inventaire d'objets"),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const player = getPlayer(interaction.guildId, interaction.user.id);
    const inventory = getInventory(interaction.guildId, interaction.user.id);

    const lines =
      inventory.length === 0
        ? [
            "_Ton inventaire est vide…_",
            "",
            "💡 Fais `/boutique` puis `/acheter` pour commencer ta collection !",
          ]
        : inventory.map((row) => {
            const item = getShopItem(row.item_id);
            if (!item) return `- x${row.quantity} (objet inconnu : ${row.item_id})`;
            return `${item.emoji} **${item.name}** — x${row.quantity}`;
          });

    const embed = createEmbed()
      .setTitle(`🎒 Inventaire de ${interaction.user.username}`)
      .setDescription(lines.join("\n"))
      .addFields({
        name: "💰 Argent",
        value: `${formatNumber(player.balance)} ${config.currency}`,
        inline: true,
      });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
