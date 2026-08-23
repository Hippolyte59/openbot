import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import {
  hasModAccess,
  moderationError,
} from "../utils/moderation.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";

const DURATIONS = [
  { name: "60 secondes", value: 60 },
  { name: "5 minutes", value: 300 },
  { name: "10 minutes", value: 600 },
  { name: "1 heure", value: 3600 },
  { name: "1 jour", value: 86_400 },
  { name: "1 semaine", value: 604_800 },
];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("timeout")
    .setDescription("🔇 Rend un membre muet temporairement")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à rendre muet")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duree")
        .setDescription("Durée du silence")
        .setRequired(true)
        .addChoices(
          ...DURATIONS.map((duration) => ({
            name: duration.name,
            value: String(duration.value),
          })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("Motif")
        .setMaxLength(500),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    if (!hasModAccess(interaction, PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        embeds: [errorEmbed("Tu n'as pas la permission de modérer des membres.")],
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

    if (!targetMember!.moderatable) {
      await interaction.reply({
        embeds: [errorEmbed("Je ne peux pas rendre ce membre muet (rôle supérieur au mien ?).")],
        ephemeral: true,
      });
      return;
    }

    const seconds = Number(
      interaction.options.getString("duree", true),
    );
    const reason =
      interaction.options.getString("raison") ??
      `Rendu muet par ${interaction.user.username}`;

    await targetMember!.timeout(seconds * 1000, reason);

    const label =
      DURATIONS.find((duration) => duration.value === seconds)?.name ??
      `${seconds} s`;

    await interaction.reply({
      embeds: [
        createEmbed("warning").setTitle("🔇 Membre rendu muet").setDescription(
          [
            `**${targetUser.tag}** est muet pendant **${label}**.`,
            `> Raison : ${reason}`,
          ].join("\n"),
        ),
      ],
    });
  },
} satisfies Command;
