import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { SHOP_ITEMS, getShopItem } from "../data/items.js";
import { addItem } from "../database/inventory.js";
import { getPlayer, removeBalance } from "../database/players.js";
import { createEmbed, errorEmbed, successEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("acheter")
    .setDescription("🛍️ Achète un objet de la boutique")
    .addStringOption((option) =>
      option
        .setName("objet")
        .setDescription("L'objet à acheter")
        .setRequired(true)
        .addChoices(
          ...SHOP_ITEMS.map((item) => ({
            name: `${item.emoji} ${item.name}`,
            value: item.id,
          })),
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName("quantite")
        .setDescription("Quantité (1 par défaut)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const itemId = interaction.options.getString("objet", true);
    const quantity = interaction.options.getInteger("quantite") ?? 1;
    const item = getShopItem(itemId);

    if (!item) {
      await interaction.reply({
        embeds: [errorEmbed("Cet objet n'existe pas.")],
      });
      return;
    }

    const total = item.price * quantity;
    const player = getPlayer(interaction.guildId, interaction.user.id);

    if (player.balance < total) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Il te manque **${formatNumber(total - player.balance)} ${config.currency}** pour acheter ${quantity > 1 ? `x${quantity} ` : ""}${item.emoji} **${item.name}**.`,
          ),
        ],
      });
      return;
    }

    removeBalance(interaction.guildId, interaction.user.id, total);
    addItem(interaction.guildId, interaction.user.id, item.id, quantity);

    await interaction.reply({
      embeds: [
        successEmbed(
          `${item.emoji} Tu as acheté ${quantity > 1 ? `x${quantity} **${item.name}**` : `**${item.name}**`} pour **${formatNumber(total)} ${config.currency}**.\n\n💡 Utilise \`/utiliser\` pour t'en servir !`,
        ),
      ],
    });
  },
} satisfies Command;
