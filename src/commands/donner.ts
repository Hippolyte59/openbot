import { SlashCommandBuilder, type User } from "discord.js";
import type { Command } from "../types.js";
import { addBalance, getPlayer, removeBalance } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("donner")
    .setDescription("🎁 Donne des pièces à un autre membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre qui reçoit les pièces")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le montant à donner")
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const target: any = interaction.options.getUser("membre", true);
    const amount = interaction.options.getInteger("montant", true);

    if (target.bot) {
      await interaction.reply({
        embeds: [errorEmbed("Les bots n'ont pas besoin de pièces ! 🤖")],
      });
      return;
    }

    if (target.id === interaction.user.id) {
      await interaction.reply({
        embeds: [errorEmbed("Tu ne peux pas te donner des pièces à toi-même.")],
      });
      return;
    }

    if (!removeBalance(interaction.guildId, interaction.user.id, amount)) {
      const player = getPlayer(interaction.guildId, interaction.user.id);
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Tu n'as que **${formatNumber(player.balance)} ${config.currency}**, c'est insuffisant.`,
          ),
        ],
      });
      return;
    }

    addBalance(interaction.guildId, target.id, amount);

    const embed = createEmbed()
      .setTitle("🎁 Don réussi")
      .setDescription(
        `${interaction.user} a donné **${formatNumber(amount)} ${config.currency}** à ${target} !`,
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
