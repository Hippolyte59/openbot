import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { addBalance, getPlayer, updatePlayer } from "../database/players.js";
import { applyAnimalBonus } from "../data/animals.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatDuration, formatNumber } from "../utils/format.js";
import { config } from "../config.js";

/** Fenêtre max pour conserver sa série : 48 h */
const STREAK_WINDOW = 2 * config.cooldowns.daily;

export default {
  data: new SlashCommandBuilder()
    .setName("quotidien")
    .setDescription("🎁 Récupère ta récompense quotidienne"),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const player = getPlayer(interaction.guildId, interaction.user.id);
    const now = Date.now();
    const elapsed = now - player.last_daily;

    if (elapsed < config.cooldowns.daily) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Ta prochaine récompense est disponible dans **${formatDuration(config.cooldowns.daily - elapsed)}**.`,
          ),
        ],
      });
      return;
    }

    // Série conservée si on revient sous 48 h, sinon elle retombe à 1
    const streak =
      player.last_daily > 0 && elapsed <= STREAK_WINDOW
        ? player.daily_streak + 1
        : 1;

    const baseReward = 100 + Math.min(streak - 1, 10) * 25;
    const reward = applyAnimalBonus(player.animal, baseReward);
    const bonus = reward - baseReward;

    addBalance(interaction.guildId, interaction.user.id, reward);
    updatePlayer(interaction.guildId, interaction.user.id, {
      last_daily: now,
      daily_streak: streak,
    });

    const embed = createEmbed("success")
      .setTitle("🎁 Récompense quotidienne")
      .setDescription(
        [
          `Tu récupères **+${formatNumber(reward)} ${config.currency}** !`,
          bonus > 0
            ? `\n🐾 Ton animal ajoute **+${bonus} ${config.currency}** de bonus.`
            : "",
          "",
          `🔥 Série : **${streak}** jour(s) — continue chaque jour pour augmenter le bonus !`,
          `⏳ Prochaine récompense dans 24 h.`,
        ]
          .filter(Boolean)
          .join("\n"),
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
