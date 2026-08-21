import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../types.js";
import {
  hasModAccess,
  moderationError,
} from "../utils/moderation.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Expulse un membre du serveur")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à expulser")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Motif de l'expulsion")
        .setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    if (
      !hasModAccess(interaction, PermissionFlagsBits.KickMembers)
    ) {
      await interaction.reply({
        embeds: [errorEmbed("Tu n'as pas la permission d'expulser des membres.")],
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("membre", true);
    const targetMember =
      await interaction.guild!.members
        .fetch(targetUser.id)
        .catch(() => null);
    const error = moderationError(interaction, targetMember);
    if (error) {
      await interaction.reply({
        embeds: [errorEmbed(error)],
        ephemeral: true,
      });
      return;
    }

    if (!targetMember!.kickable) {
      await interaction.reply({
        embeds: [errorEmbed("Je ne peux pas expulser ce membre (rôle supérieur au mien ?).")],
        ephemeral: true,
      });
      return;
    }

    const reason =
      interaction.options.getString("raison") ??
      `Expulsé par ${interaction.user.username}`;

    try {
      await targetMember!.send(
        `👢 Tu as été expulsé de **${interaction.guild!.name}**.\n> Raison : ${reason}`,
      );
    } catch {

    }

    await targetMember!.kick(reason);

    await interaction.reply({
      embeds: [
        createEmbed("warning")
          .setTitle("👢 Membre expulsé")
          .setDescription(
            `**${targetUser.tag}** a été expulsé.\n> Raison : ${reason}`,
          ),
      ],
    });
  },
} satisfies Command;
