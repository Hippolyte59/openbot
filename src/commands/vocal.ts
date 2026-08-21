import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import type { Command } from "../types.js";
import {
  deleteVoiceChannel,
  findVoiceChannelByOwner,
  getVoiceHub,
  removeVoiceHubByGuild,
  setVoiceHub,
} from "../database/voice.js";
import {
  accessOf,
  createPersonalChannel,
} from "../systems/vocal.js";
import {
  hasModAccess,
} from "../utils/moderation.js";
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
    .addSubcommandGroup((group) =>
      group
        .setName("hub")
        .setDescription(
          "📡 Configure le salon « rejoindre pour créer » du serveur",
        )
        .addSubcommand((sub) =>
          sub
            .setName("creer")
            .setDescription("➕ Crée le salon hub : y entrer ouvre un vocal perso")
            .addStringOption((option) =>
              option
                .setName("nom")
                .setDescription("Nom du hub (défaut : « ➕ Créer un salon »)")
                .setMaxLength(32),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("definir")
            .setDescription("📍 Désigne un salon vocal existant comme hub")
            .addChannelOption((option) =>
              option
                .setName("salon")
                .setDescription("Le salon vocal à transformer en hub")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("retirer")
            .setDescription("🚫 Désactive le « rejoindre pour créer »"),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("creer")
        .setDescription("🎤 Crée ton propre salon vocal avec panneau de contrôle")
        .addStringOption((option) =>
          option
            .setName("nom")
            .setDescription("Nom du salon (32 caractères max)")
            .setMaxLength(32),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("info").setDescription("📊 Affiche l'état de ton salon vocal"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("supprimer")
        .setDescription("🗑️ Supprime ton salon vocal personnel"),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const sub = interaction.options.getSubcommandGroup(false);
    if (sub === "hub") {
      await handleHub(interaction);
      return;
    }

    const command = interaction.options.getSubcommand(true);

    if (command === "creer") {
      await createPersonalChannel(
        interaction,
        interaction.options.getString("nom"),
      );
      return;
    }

    if (command === "info") {
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

async function handleHub(
  interaction: import("discord.js").ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inGuild()) return;
  const guildId = interaction.guildId;

  if (!hasModAccess(interaction, PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      embeds: [
        errorEmbed(
          "Seuls les administrateurs (ou rôles autorisés via `/admin roles ajouter`) peuvent configurer le hub.",
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const sub = interaction.options.getSubcommand(true);

  if (sub === "creer") {
    const name =
      interaction.options.getString("nom") ?? "➕ Créer un salon";

    const channel = await interaction.guild!.channels.create({
      name: name.slice(0, 32),
      type: ChannelType.GuildVoice,
      reason: `Hub « rejoindre pour créer » configuré par ${interaction.user.username}`,
    });
    setVoiceHub(guildId, channel.id);

    await interaction.reply({
      embeds: [
        successEmbed(
          `Le hub ${channel} est en place : dès qu'un membre y entre, son salon personnel est créé et il y est déplacé automatiquement.`,
        ),
      ],
    });
    return;
  }

  if (sub === "definir") {
    const channel = interaction.options.getChannel("salon", true);
    setVoiceHub(guildId, channel.id);
    await interaction.reply({
      embeds: [
        successEmbed(
          `${channel} est maintenant le hub : y entrer crée un salon vocal personnel.`,
        ),
      ],
    });
    return;
  }

  const hub = getVoiceHub(guildId);
  removeVoiceHubByGuild(guildId);
  await interaction.reply({
    embeds: [
      createEmbed("warning").setDescription(
        hub
          ? `Le « rejoindre pour créer » est désactivé (<#${hub.channel_id}> redevient un salon normal).`
          : "Aucun hub n'était configuré.",
      ),
    ],
  });
}
