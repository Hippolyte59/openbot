import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types.js";
import { hasModAccess } from "../utils/moderation.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("🐢 Définit le mode lent du salon actuel")
    .addIntegerOption((option) =>
      option
        .setName("secondes")
        .setDescription(
          "Délai entre deux messages (0 pour désactiver, max 21600)",
        )
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21_600),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    if (
      !hasModAccess(interaction, PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({
        embeds: [createEmbed("error").setDescription("❌ Tu n'as pas la permission de gérer les salons.")],
        ephemeral: true,
      });
      return;
    }

    const seconds = interaction.options.getInteger("secondes", true);
    const channel = interaction.channel;

    if (!channel || !("setRateLimitPerUser" in channel)) {
      await interaction.reply({
        embeds: [createEmbed("error").setDescription("❌ Ce salon ne supporte pas le mode lent.")],
        ephemeral: true,
      });
      return;
    }

    await channel.setRateLimitPerUser(
      seconds,
      `Mode lent défini par ${interaction.user.username}`,
    );

    await interaction.reply({
      embeds: [
        createEmbed("success").setDescription(
          seconds === 0
            ? "✅ Mode lent **désactivé**."
            : `✅ Mode lent réglé sur **${seconds} seconde(s)**.`,
        ),
      ],
      ephemeral: true,
    });
  },
} satisfies Command;
