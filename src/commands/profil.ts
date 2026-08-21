import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getPlayer, xpNeededFor } from "../database/players.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber, progressBar } from "../utils/format.js";
import { config } from "../config.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("👤 Affiche le profil d'un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont voir le profil (toi par défaut)")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const target =
      interaction.options.getUser("membre") ?? interaction.user;
    const player = getPlayer(interaction.guildId, target.id);

    const needed = xpNeededFor(player.level);

    const embed = createEmbed()
      .setAuthor({
        name: `Profil de ${target.username}`,
        iconURL: target.displayAvatarURL(),
      })
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: "💰 Argent",
          value: `${formatNumber(player.balance)} ${config.currency}`,
          inline: true,
        },
        {
          name: "⭐ Niveau",
          value: `${player.level}`,
          inline: true,
        },
        {
          name: "🔥 Série quotidienne",
          value: `${player.daily_streak} jour(s)`,
          inline: true,
        },
      );

    if (target.bot && target.id !== interaction.client.user.id) {
      embed.setDescription("🤖 C'est un bot… il n'a pas besoin de pièces !");
      await interaction.reply({ embeds: [embed] });
      return;
    }

    embed.addFields({
      name: "📈 XP",
      value: `${progressBar(player.xp, needed)}\n**${formatNumber(player.xp)} / ${formatNumber(needed)}** XP`,
    });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
