import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 Supprime des messages en masse dans ce salon")
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Nombre de messages à supprimer (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription(
          "Ne supprimer que les messages de ce membre (optionnel)",
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.inGuild()) return;
    if (!interaction.channel?.isTextBased()) return;

    const amount = interaction.options.getInteger("nombre", true);
    const target = interaction.options.getUser("membre");

    await interaction.deferReply({ ephemeral: true });

    try {
      const deleted = await (interaction.channel as any).bulkDelete(amount, true);
      const filtered = target
        ? deleted.filter((message) => message?.author?.id === target.id)
        : deleted;

      const description = [
        `🧹 **${filtered.size}** message(s) supprimé(s).`,
        target ? `Filtre : messages de ${target}.` : null,
        "_Les messages de plus de 14 jours ne peuvent pas être supprimés en masse._",
      ]
        .filter(Boolean)
        .join("\n");

      await interaction.editReply({
        embeds: [createEmbed("success").setDescription(description)],
      });

      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    } catch {
      await interaction.editReply({
        embeds: [createEmbed("error").setDescription("❌ Impossible de supprimer les messages — vérifie mes permissions.")],
      });
    }
  },
} satisfies Command;
