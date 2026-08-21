import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../types.js";
import {
  addWarning,
  getWarnings,
  removeWarningById,
} from "../database/warnings.js";
import {
  hasModAccess,
  moderationError,
} from "../utils/moderation.js";
import { createEmbed, errorEmbed, successEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("⚠️ Gère les avertissements d'un membre")
    .addSubcommand((sub) =>
      sub
        .setName("ajouter")
        .setDescription("⚠️ Avertit un membre")
        .addUserOption((option) =>
          option.setName("membre").setDescription("Le membre à avertir").setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("raison")
            .setDescription("Motif de l'avertissement")
            .setRequired(true)
            .setMaxLength(500),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("liste")
        .setDescription("📋 Affiche les avertissements d'un membre")
        .addUserOption((option) =>
          option
            .setName("membre")
            .setDescription("Le membre concerné")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("retirer")
        .setDescription("🗑️ Retire un avertissement par son numéro")
        .addUserOption((option) =>
          option
            .setName("membre")
            .setDescription("Le membre concerné")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("numero")
            .setDescription("Numéro de l'avertissement (visible dans /warn liste)")
            .setRequired(true)
            .setMinValue(1),
        ),
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

    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand(true);

    if (sub === "ajouter") {
      const targetUserForAdd = interaction.options.getUser("membre", true);
      const targetMember =
        await interaction.guild!.members
          .fetch(targetUserForAdd.id)
          .catch(() => null);
      const error = moderationError(interaction, targetMember);
      if (error) {
        await interaction.reply({ embeds: [errorEmbed(error)], ephemeral: true });
        return;
      }

      const target = interaction.options.getUser("membre", true);
      const reason = interaction.options.getString("raison", true);
      addWarning(guildId, target.id, reason, interaction.user.id);

      const count = getWarnings(guildId, target.id).length;
      await interaction.reply({
        embeds: [
          createEmbed("warning").setTitle("⚠️ Avertissement").setDescription(
            [
              `${target} a reçu un avertissement.`,
              `> Raison : ${reason}`,
              "",
              `📊 Total : **${count}** avertissement(s).`,
            ].join("\n"),
          ),
        ],
      });
      return;
    }

    const target = interaction.options.getUser("membre", true);
    const warnings = getWarnings(guildId, target.id);

    if (sub === "liste") {
      const lines: string[] =
        warnings.length === 0
          ? ["_Aucun avertissement._"]
          : warnings.map(
              (warning, index) =>
                `\`#${index + 1}\` — ${warning.reason} _(<t:${warning.created_at}:R>)_`,
            );

      await interaction.reply({
        embeds: [
          createEmbed()
            .setTitle(`⚠️ Avertissements de ${target.username}`)
            .setDescription(lines.join("\n")),
        ],
        ephemeral: true,
      });
      return;
    }

    const numero = interaction.options.getInteger("numero", true);
    const warning = warnings[numero - 1];
    if (!warning) {
      await interaction.reply({
        embeds: [errorEmbed(`L'avertissement #${numero} n'existe pas.`)],
        ephemeral: true,
      });
      return;
    }

    removeWarningById(guildId, target.id, warning.id);
    await interaction.reply({
      embeds: [
        successEmbed(
          `✅ Avertissement **#${numero}** retiré à ${target}.`,
        ),
      ],
      ephemeral: true,
    });
  },
} satisfies Command;
