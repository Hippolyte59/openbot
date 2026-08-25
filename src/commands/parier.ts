import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { addBalance, getPlayer, removeBalance } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

const FACES = ["Pile", "Face"];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("parier")
    .setDescription("Pile ou face : double la mise ou tout perd")
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le montant à miser")
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const amount = interaction.options.getInteger("montant", true);
    const player = getPlayer(interaction.guildId, interaction.user.id);

    if (player.balance < amount) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Tu n'as que **${formatNumber(player.balance)} ${config.currency}**, ce n'est pas assez pour miser ${formatNumber(amount)} !`,
          ),
        ],
      });
      return;
    }

    removeBalance(interaction.guildId, interaction.user.id, amount);

    const won = Math.random() < 0.5;
    const face = FACES[Math.floor(Math.random() * FACES.length)];

    if (won) {
      addBalance(interaction.guildId, interaction.user.id, amount * 2);

      const embed = createEmbed("success")
        .setTitle("La pièce tourne…")
        .setDescription(
          [
            `Résultat : **${face}**`,
            "",
            `Gagné ! Tu doubles ta mise et remportes **+${formatNumber(amount)} ${config.currency}** !`,
          ].join("\n"),
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const embed = createEmbed("error")
      .setTitle("La pièce tourne…")
      .setDescription(
        [
          `Résultat : **${face === FACES[0] ? FACES[1] : FACES[0]}**`,
          "",
          `Perdu… Tu perds ta mise de **${formatNumber(amount)} ${config.currency}**.`,
        ].join("\n"),
      );
    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
