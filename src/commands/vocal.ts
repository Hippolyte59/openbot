import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import {
  deleteVoiceChannel,
  findVoiceChannelByOwner,
} from "../database/voice.js";
import {
  accessOf,
  createPersonalChannel,
} from "../systems/vocal.js";
import { createEmbed, errorEmbed, successEmbed } from "../utils/embeds.js";

const ACCESS_LABELS = {
  open: "Ouvert à tous",
  locked: "Verrouillé",
  hidden: "Caché",
} as const;

export default {
  data: new SlashCommandBuilder()
    .setName("vocal")
    .setDescription("🔊 Gère ton salon vocal personnel")
    .addSubcommand((sub) =>
      sub
        .setName("creer")
        .setDescription("Crée ton propre salon vocal avec panneau de contrôle")
        .addStringOption((option) =>
          option
            .setName("nom")
            .setDescription("Nom du salon (32 caractères max)")
            .setMaxLength(32),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("info").setDescription("Affiche l'état de ton salon vocal"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("supprimer")
        .setDescription("Supprime ton salon vocal personnel"),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const sub = interaction.options.getSubcommand(true);

    if (sub === "creer") {
      await createPersonalChannel(
        interaction,
        interaction.options.getString("nom"),
      );
      return;
    }

    if (sub === "info") {
      const row = findVoiceChannelByOwner(
        interaction.guildId,
        interaction.user.id,
      );
      if (!row) {
        await interaction.reply({
          embeds: [errorEmbed("Tu ne possèdes aucun salon. Crée-en un avec `/vocal creer` !")],
          ephemeral: true,
        });
        return;
      }

      const channel =
        await interaction.guild!.channels.fetch(row.channel_id).catch(() => null);
      if (!channel?.isVoiceBased()) {
        await interaction.reply({
          embeds: [errorEmbed("Ton salon n'existe plus — crée-en un nouveau.")],
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        embeds: [
          createEmbed()
            .setTitle("🔊 Ton salon vocal")
            .addFields(
              { name: "Salon", value: `${channel}`, inline: true },
              {
                name: "Accès",
                value: ACCESS_LABELS[accessOf(channel)],
                inline: true,
              },
              {
                name: "Places",
                value:
                  channel.userLimit === 0
                    ? "Illimité"
                    : `${channel.userLimit}`,
                inline: true,
              },
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    // supprimer
    const row = findVoiceChannelByOwner(
      interaction.guildId,
      interaction.user.id,
    );
    if (!row) {
      await interaction.reply({
        embeds: [errorEmbed("Tu ne possèdes aucun salon vocal.")],
        ephemeral: true,
      });
      return;
    }

    deleteVoiceChannel(row.channel_id);
    const channel =
      await interaction.guild!.channels.fetch(row.channel_id).catch(() => null);
    if (channel?.isVoiceBased() && channel.deletable) {
      await channel.delete("Salon vocal supprimé par son propriétaire");
    }

    await interaction.reply({
      embeds: [successEmbed("Ton salon vocal a été supprimé.")],
      ephemeral: true,
    });
  },
} satisfies Command;
