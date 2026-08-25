import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import {
  hasModAccess,
  moderationError,
} from "../utils/moderation.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("ban")
    .setDescription("Bannit un membre du serveur")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à bannir")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Motif du bannissement")
        .setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    if (!hasModAccess(interaction, PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        embeds: [errorEmbed("Tu n'as pas la permission de bannir des membres.")],
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser("membre", true);
    const targetMember =
      await interaction.guild!.members
        .fetch(targetUser.id)
        .catch(() => null);
    const reason =
      interaction.options.getString("raison") ??
      `Banni par ${interaction.user.username}`;

    if (!targetMember) {

      await interaction.guild!.members.ban(targetUser.id, {
        deleteMessageSeconds: 86_400,
        reason,
      });
      await interaction.reply({
        embeds: [
          createEmbed("error")
            .setTitle("Membre banni")
            .setDescription(
              `**${targetUser.tag}** a été banni (il avait déjà quitté le serveur).\n> Raison : ${reason}`,
            ),
        ],
      });
      return;
    }

    const error = moderationError(interaction, targetMember);
    if (error) {
      await interaction.reply({
        embeds: [errorEmbed(error)],
        ephemeral: true,
      });
      return;
    }

    try {
      await targetMember.send(
        `Tu as été banni de **${interaction.guild!.name}**.\n> Raison : ${reason}`,
      );
    } catch {

    }

    await interaction.guild!.members.ban(targetUser.id, {
      deleteMessageSeconds: 86_400,
      reason,
    });

    await interaction.reply({
      embeds: [
        createEmbed("error")
          .setTitle("Membre banni")
          .setDescription(
            `**${targetUser.tag}** a été banni (messages des dernières 24 h supprimés).\n> Raison : ${reason}`,
          ),
      ],
    });
  },
} satisfies Command;
