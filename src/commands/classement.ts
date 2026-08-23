import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getLeaderboard } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";

const MEDALS = ["🥇", "🥈", "🥉"];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("classement")
    .setDescription("🏆 Affiche le top 10 du serveur")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Classement à afficher")
        .setRequired(true)
        .addChoices(
          { name: "💰 Argent", value: "balance" },
          { name: "⭐ Niveau", value: "level" },
          { name: "📈 XP totale", value: "xp" },
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const column = interaction.options.getString("type", true);
    const rows = getLeaderboard(interaction.guildId, column as "balance");

    if (rows.length === 0) {
      await interaction.reply({
        embeds: [errorEmbed("Aucune donnée pour le moment. Joue un peu !")],
      });
      return;
    }

    const titles: Record<string, string> = {
      balance: "💰 Les plus riches",
      level: "⭐ Les plus expérimentés (niveau)",
      xp: "📈 Les plus actifs (XP totale)",
    };

    const lines = rows.map((row, index) => {
      const rank = MEDALS[index] ?? `\`#${index + 1}\``;
      const value =
        column === "level"
          ? `niveau ${row.value}`
          : formatNumber(row.value);
      return `${rank} <@${row.user_id}> — **${value}**`;
    });

    const embed = createEmbed()
      .setTitle(`🏆 ${titles[column]}`)
      .setDescription(lines.join("\n"));

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
