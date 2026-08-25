import * as pkg from "discord.js";
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import {
  getPlayer,
  updatePlayer,
} from "../database/players.js";
import { createEmbed, errorEmbed, successEmbed } from "../utils/embeds.js";

const DIVORCE_COST = 500;

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("mariage")
    .setDescription("Gère ta vie de couple")
    .addSubcommand((sub) =>
      sub
        .setName("proposer")
        .setDescription("Demande un membre en mariage")
        .addUserOption((option) =>
          option
            .setName("membre")
            .setDescription("L'élu(e) de ton cœur")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("statut")
        .setDescription("Affiche ta situation amoureuse"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("divorcer")
        .setDescription(
          `Divorce (frais : ${DIVORCE_COST} pièces)`,
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const sub = interaction.options.getSubcommand(true);

    if (sub === "statut") {
      const player = getPlayer(guildId, userId);
      if (!player.partner) {
        await interaction.reply({
          embeds: [errorEmbed("Tu es célibataire. Tente ta chance avec `/mariage proposer` !")],
        });
        return;
      }

      await interaction.reply({
        embeds: [
          createEmbed()
            .setTitle("Mariage")
            .setDescription(
              `Tu es marié(e) avec <@${player.partner}> depuis le <t:${Math.floor(Date.now() / 1000)}:D>.`,
            ),
        ],
      });
      return;
    }

    if (sub === "divorcer") {
      const player = getPlayer(guildId, userId);
      if (!player.partner) {
        await interaction.reply({
          embeds: [errorEmbed("Tu n'es pas marié(e).")],
          ephemeral: true,
        });
        return;
      }
      if (player.balance < DIVORCE_COST) {
        await interaction.reply({
          embeds: [
            errorEmbed(
              `Le divorce coûte **${DIVORCE_COST} ** (avocat compris) et tu n'as que **${player.balance} **.`,
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      const partnerId = player.partner;
      updatePlayer(guildId, userId, {
        balance: player.balance - DIVORCE_COST,
        partner: null,
      });

      const partner = getPlayer(guildId, partnerId);
      if (partner?.partner === userId) {
        updatePlayer(guildId, partnerId, { partner: null });
      }

      await interaction.reply({
        embeds: [
          createEmbed("warning").setTitle("Divorce").setDescription(
            [
              `${interaction.user} a divorcé de <@${partnerId}>.`,
              `> Frais d'avocat : **${DIVORCE_COST} **`,
            ].join("\n"),
          ),
        ],
      });
      return;
    }

    const target = interaction.options.getUser("membre", true);
    const targetMember = interaction.options.getMember("membre");

    if (!targetMember) {
      await interaction.reply({
        embeds: [errorEmbed("Ce membre n'est plus sur le serveur.")],
        ephemeral: true,
      });
      return;
    }
    if (target.id === userId) {
      await interaction.reply({
        embeds: [errorEmbed("On ne peut pas se marier avec soi-même... même avec beaucoup d'amour-propre.")],
        ephemeral: true,
      });
      return;
    }
    if (target.bot) {
      await interaction.reply({
        embeds: [errorEmbed("Les bots ne croient pas au mariage.")],
        ephemeral: true,
      });
      return;
    }

    const proposer = getPlayer(guildId, userId);
    const targetPlayer = getPlayer(guildId, target.id);

    if (proposer.partner || targetPlayer.partner) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            proposer.partner && targetPlayer.partner
              ? "Vous êtes tous les deux déjà mariés... ce serait compliqué."
              : proposer.partner
                ? "Tu es déjà marié(e) ! Passe par `/mariage divorcer` d'abord."
                : `${target.username} est déjà marié(e).`,
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const row = new (ActionRowBuilder as any)().addComponents(
      new ButtonBuilder()
        .setCustomId(`mari:${target.id}:accept`)
        .setLabel("Oui !")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`mari:${target.id}:refuse`)
        .setLabel("Refuser")
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({
      embeds: [
        createEmbed()
          .setTitle("Demande en mariage")
          .setDescription(
            `${target}, ${interaction.user} te demande en mariage !\n\nAcceptes-tu de passer la vie ensemble (et de partager les bonus) ?`,
          ),
      ],
      components: [row],
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      filter: (componentInteraction) =>
        componentInteraction.user.id === target.id &&
        componentInteraction.customId.startsWith(`mari:${target.id}`),
      time: 60_000,
      max: 1,
    });

    collector.on("collect", async (componentInteraction) => {
      if (componentInteraction.customId.endsWith("accept")) {
        const updatedProposer = getPlayer(guildId, userId);
        const updatedTarget = getPlayer(guildId, target.id);

        if (updatedProposer.partner || updatedTarget.partner) {
          await componentInteraction.update({
            embeds: [errorEmbed("Trop tard — l'un de vous est déjà marié(e) !")],
            components: [],
          });
          return;
        }

        updatePlayer(guildId, userId, { partner: target.id });
        updatePlayer(guildId, target.id, { partner: userId });

        await componentInteraction.update({
          embeds: [
            successEmbed(
              `${interaction.user} et ${target} sont maintenant mariés ! Que la fête commence.`,
            ),
          ],
          components: [],
        });
      } else {
        await componentInteraction.update({
          embeds: [
            createEmbed("error").setDescription(
              `${target} a refusé la demande de ${interaction.user}. Le cœur brisé se soigne avec le temps...`,
            ),
          ],
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction
          .editReply({
            embeds: [errorEmbed(`${target} n'a jamais répondu à la demande.`)],
            components: [],
          })
          .catch(() => {});
      }
    });
  },
} satisfies Command;
