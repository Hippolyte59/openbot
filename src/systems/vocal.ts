import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type EmbedBuilder,
  type GuildMember,
  type ModalSubmitInteraction,
  type VoiceBasedChannel,
  type VoiceState,
} from "discord.js";
import {
  deleteVoiceChannel,
  findVoiceChannelByOwner,
  getVoiceChannel,
  getVoiceHub,
  saveVoiceChannel,
  setVoicePanelMessage,
  transferVoiceOwnership,
} from "../database/voice.js";
import {
  createEmbed,
  errorEmbed,
  successEmbed,
} from "../utils/embeds.js";

const EMPTY_GRACE_MS = 10_000;

type AccessState = "open" | "locked" | "hidden";

const ACCESS_LABELS: Record<AccessState, string> = {
  open: "Ouvert à tous",
  locked: "Verrouillé",
  hidden: "Caché",
};

export function accessOf(channel: VoiceBasedChannel): AccessState {
  const everyone = channel.guild.roles.everyone;
  const deny = channel.permissionOverwrites.cache.get(everyone.id)?.deny;
  if (deny?.has(PermissionFlagsBits.ViewChannel)) return "hidden";
  if (deny?.has(PermissionFlagsBits.Connect)) return "locked";
  return "open";
}

function panelEmbed(
  channel: VoiceBasedChannel,
  ownerId: string,
): EmbedBuilder {
  const access = accessOf(channel);
  const limit =
    channel.userLimit === 0 ? "Illimité" : `${channel.userLimit} personne(s)`;

  return createEmbed()
    .setTitle(`🎛️ Panneau — ${channel.name}`)
    .setDescription(
      [
        `> Propriétaire : <@${ownerId}>`,
        "",
        "**Contrôles disponibles** : verrouiller le salon, le cacher,",
        "limiter le nombre de places, le renommer ou le fermer.",
      ].join("\n"),
    )
    .addFields(
      { name: "🔓 Accès", value: ACCESS_LABELS[access], inline: true },
      { name: "👥 Places", value: limit, inline: true },
      { name: "🗑️ Fermeture", value: "Automatique si vide", inline: true },
    );
}

function panelRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("vc-lock")
      .setLabel("Verrouiller")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc-hide")
      .setLabel("Cacher")
      .setEmoji("🙈")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc-limit")
      .setLabel("Places")
      .setEmoji("👥")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc-name")
      .setLabel("Renommer")
      .setEmoji("✏️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("vc-close")
      .setLabel("Fermer")
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Danger),
  );
}

async function postPanel(
  channel: VoiceBasedChannel,
  ownerId: string,
): Promise<void> {
  try {
    const message = await channel.send({
      embeds: [panelEmbed(channel, ownerId)],
      components: [panelRow()],
    });
    setVoicePanelMessage(channel.id, message.id);
  } catch {

  }
}

export async function refreshPanel(
  guild: import("discord.js").Guild,
  channelId: string,
): Promise<void> {
  const row = getVoiceChannel(channelId);
  if (!row?.message_id) return;

  const channel = await guild.channels
    .fetch(channelId)
    .catch(() => null);
  if (!channel?.isVoiceBased()) return;

  const message = await channel.messages
    .fetch(row.message_id)
    .catch(() => null);
  if (!message) return;

  await message
    .edit({
      embeds: [panelEmbed(channel, row.owner_id)],
      components: [panelRow()],
    })
    .catch(() => {});
}

async function createVoiceRoom(
  member: GuildMember,
  name: string | null,
  parentId?: string | null,
): Promise<VoiceBasedChannel> {
  const guild = member.guild;

  const channel = await guild.channels.create({
    name: (name ?? `Vocal de ${member.displayName}`).slice(0, 32),
    type: ChannelType.GuildVoice,
    ...(parentId ? { parent: parentId } : {}),
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.ManageChannels,
        ],
      },
    ],
    reason: `Salon vocal personnel créé par ${member.user.username}`,
  });

  saveVoiceChannel((channel as any).id, guild.id, member.id, null);
  await postPanel(channel as any, member.id);

  return channel;
}

export async function createPersonalChannel(
  interaction: ChatInputCommandInteraction,
  name: string | null,
): Promise<void> {
  const member = interaction.member as GuildMember;

  if (findVoiceChannelByOwner(interaction.guildId!, member.id)) {
    await interaction.reply({
      embeds: [
        errorEmbed(
          "Tu possèdes déjà un salon vocal. Utilise `/vocal info` pour le retrouver ou supprime-le d'abord.",
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const channel = await createVoiceRoom(
    member,
    name,
    member.voice.channel?.parentId ?? undefined,
  );

  let moved = false;
  if (member.voice.channel) {
    moved = await member.voice.setChannel(channel).then(() => true, () => false);
  }

  await interaction.reply({
    embeds: [
      successEmbed(
        `Ton salon ${channel} est prêt ! Un panneau de contrôle y a été ajouté.`,
      ).addFields({
        name: "Astuce",
        value: moved
          ? "Tu as été déplacé automatiquement."
          : "Rejoins-le pour l'utiliser — il sera supprimé quand il sera vide.",
        inline: false,
      }),
    ],
    ephemeral: true,
  });
}

export async function handleVocalButton(
  interaction: ButtonInteraction,
): Promise<boolean> {
  if (!interaction.inGuild() || !interaction.channelId) return false;
  if (!interaction.customId.startsWith("vc-")) return false;

  const row = getVoiceChannel(interaction.channelId);
  if (!row) return false;

  const action = interaction.customId;

  if (interaction.user.id !== row.owner_id) {
    await interaction.reply({
      embeds: [errorEmbed("Seul le propriétaire du salon peut utiliser ce panneau.")],
      ephemeral: true,
    });
    return true;
  }

  const channel = interaction.channel;

  if (!channel || !channel.isVoiceBased()) {
    await interaction.reply({
      embeds: [errorEmbed("Ce panneau n'est plus lié à un salon valide.")],
      ephemeral: true,
    });
    return true;
  }

  if (action === "vc-limit") {
    const modal = new ModalBuilder()
      .setCustomId("vc-modal-limit")
      .setTitle("Limite de places")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("limit-input")
            .setLabel("Nombre maximum de personnes (0 = illimité)")
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(2)
            .setValue(String(channel.userLimit)),
        ),
      );
    await interaction.showModal(modal);
    return true;
  }

  if (action === "vc-name") {
    const modal = new ModalBuilder()
      .setCustomId("vc-modal-name")
      .setTitle("Renommer le salon")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("name-input")
            .setLabel("Nouveau nom du salon")
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(32)
            .setValue(channel.name),
        ),
      );
    await interaction.showModal(modal);
    return true;
  }

  const everyone = interaction.guild!.roles.everyone.id;

  if (action === "vc-lock") {
    const locked = accessOf(channel) === "locked";
    await channel.permissionOverwrites.edit(everyone, {
      Connect: locked ? null : false,
    });
    await interaction.update({
      embeds: [panelEmbed(channel, row.owner_id)],
      components: [panelRow()],
    });
    return true;
  }

  if (action === "vc-hide") {
    const hidden = accessOf(channel) === "hidden";
    await channel.permissionOverwrites.edit(everyone, {
      ViewChannel: hidden ? null : false,
      Connect: hidden ? null : false,
    });
    await interaction.update({
      embeds: [panelEmbed(channel, row.owner_id)],
      components: [panelRow()],
    });
    return true;
  }

  if (action === "vc-close") {
    await interaction.deferUpdate();
    deleteVoiceChannel(channel.id);
    await channel.delete("Salon vocal fermé par son propriétaire");
    return true;
  }

  return true;
}

export async function handleVocalModal(
  interaction: ModalSubmitInteraction,
): Promise<boolean> {
  if (
    interaction.customId !== "vc-modal-limit" &&
    interaction.customId !== "vc-modal-name"
  ) {
    return false;
  }
  if (!interaction.inGuild() || !interaction.channelId) return true;

  const row = getVoiceChannel(interaction.channelId);
  if (!row || interaction.user.id !== row.owner_id) {
    await interaction.reply({
      embeds: [errorEmbed("Seul le propriétaire du salon peut utiliser ce panneau.")],
      ephemeral: true,
    });
    return true;
  }

  const channel = interaction.channel;
  if (!channel?.isVoiceBased()) return true;

  if (interaction.customId === "vc-modal-limit") {
    const raw = interaction.fields.getTextInputValue("limit-input");
    const limit = Math.min(99, Math.max(0, Number(raw) || 0));
    await channel.setUserLimit(limit);
    await interaction.reply({
      embeds: [
        successEmbed(
          limit === 0
            ? "Places illimitées."
            : `Limite fixée à **${limit}** personne(s).`,
        ),
      ],
      ephemeral: true,
    });
  } else {
    const name = interaction.fields.getTextInputValue("name-input");
    await channel.setName(name.slice(0, 32));
    await interaction.reply({
      embeds: [successEmbed(`Salon renommé en **${name.slice(0, 32)}**.`)],
      ephemeral: true,
    });
  }

  await refreshPanel(interaction.guild!, channel.id);
  return true;
}

export async function handleVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  await processArrival(newState);
  processDeparture(oldState);
}

const pendingCreations = new Set<string>();

async function processArrival(state: VoiceState): Promise<void> {
  const guild = state.guild;
  const member = state.member;
  if (!guild || !member || member.user.bot || !state.channelId) return;

  const hubId = getVoiceHub(guild.id)?.channel_id;
  if (!hubId || state.channelId !== hubId) return;

  const existing = findVoiceChannelByOwner(guild.id, member.id);
  if (existing) {
    const owned = await guild.channels.fetch(existing.channel_id).catch(() => null);
    if (owned?.isVoiceBased()) {
      await member.voice.setChannel(owned).catch(() => {});
    }
    return;
  }

  const key = `${guild.id}:${member.id}`;
  if (pendingCreations.has(key)) return;
  pendingCreations.add(key);

  try {

    const hub = state.channel;
    const parentId = hub?.parentId ?? undefined;

    const channel = await createVoiceRoom(member, null, parentId);
    await member.voice.setChannel(channel).catch(() => {});
    await channel.send({
      embeds: [
        successEmbed(
          `Bienvenue ${member} ! Ce salon t'appartient — utilise le panneau ci-dessus pour le gérer.`,
        ),
      ],
    });
  } finally {
    setTimeout(() => pendingCreations.delete(key), 5_000);
  }
}

function processDeparture(oldState: VoiceState): void {
  const leftChannel = oldState.channel;
  if (!leftChannel) return;

  const row = getVoiceChannel(leftChannel.id);
  if (!row) return;

  setTimeout(async () => {
    const channel = await leftChannel.guild.channels
      .fetch(leftChannel.id)
      .catch(() => null);

    if (!channel?.isVoiceBased()) {
      deleteVoiceChannel(leftChannel.id);
      return;
    }

    const humans = channel.members.filter((member) => !member.user.bot);

    if (humans.size === 0) {
      deleteVoiceChannel(channel.id);
      await channel.delete("Salon vocal personnel vide");
      return;
    }

    if (oldState.id === row.owner_id && oldState.member) {
      const nextOwner = humans.first();
      if (!nextOwner || nextOwner.id === row.owner_id) return;

      transferVoiceOwnership(channel.id, nextOwner.id);
      await channel.permissionOverwrites
        .delete(row.owner_id)
        .catch(() => {});
      await channel.permissionOverwrites.edit(nextOwner.id, {
        ViewChannel: true,
        Connect: true,
        Speak: true,
        ManageChannels: true,
      });
      await channel.send({
        embeds: [
          successEmbed(
            `${nextOwner} devient propriétaire du salon (l'ancien propriétaire est parti).`,
          ),
        ],
      });
      await refreshPanel(channel.guild, channel.id);
    }
  }, EMPTY_GRACE_MS);
}
