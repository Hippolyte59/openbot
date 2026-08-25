import * as pkg from "discord.js";
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import { addBalance, getPlayer, removeBalance } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

const WIN_LINES = [
  "écrase son adversaire sans pitié",
  "remporte un duel acharné",
  "esquive le dernier coup et contre-attaque",
  "fait mordre la poussière à son rival",
];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("duel")
    .setDescription("Défie un autre membre en duel pour une mise")
    .addUserOption((option) =>
      option
        .setName("adversaire")
        .setDescription("Le membre à défier")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("mise")
        .setDescription("Mise du duel (les deux joueurs la paient)")
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(500),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const challenger = interaction.user;
    const opponent = interaction.options.getUser("adversaire", true);
    const stake = interaction.options.getInteger("mise", true);

    if (opponent.bot || opponent.id === challenger.id) {
      await interaction.reply({
        embeds: [errorEmbed("Choisis un adversaire humain différent de toi !")],
      });
      return;
    }

    const guildId = interaction.guildId;
    const challengerPlayer = getPlayer(guildId, challenger.id);
    const opponentPlayer = getPlayer(guildId, opponent.id);

    if (
      challengerPlayer.balance < stake ||
      opponentPlayer.balance < stake
    ) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Chaque participant doit posséder au moins la mise du duel.",
          ),
        ],
      });
      return;
    }

    const row = new (ActionRowBuilder as any)().addComponents(
      new ButtonBuilder()
        .setCustomId(`duel:${opponent.id}:accept`)
        .setLabel("Accepter")
        
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`duel:${opponent.id}:reject`)
        .setLabel("Refuser")
        
        .setStyle(ButtonStyle.Secondary),
    );

    const embed = createEmbed("primary")
      .setTitle("Défi en duel !")
      .setDescription(
        [
          `${challenger} défie ${opponent} !`,
          "",
          `Mise : **${formatNumber(stake)} ${config.currency}** de chaque côté`,
          `Le vainqueur remporte le pot : **${formatNumber(stake * 2)} ${config.currency}**`,
          "",
          `${opponent}, à toi de jouer…`,
        ].join("\n"),
      );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector.on("collect", async (button) => {
      const [, targetId, action] = button.customId.split(":");
      if (targetId !== opponent.id) {
        await button.reply({
          embeds: [errorEmbed("Ce défi ne t'est pas destiné !")],
          ephemeral: true,
        });
        return;
      }
      collector.stop(action);
    });

    collector.on("end", async (collected, reason) => {
      const disabledRow = new (ActionRowBuilder as any)().addComponents(
        ...row.components.map((c) =>
          ButtonBuilder.from(c).setDisabled(true),
        ),
      );

      if (reason === "reject") {
        const declined = createEmbed("warning").setDescription(
          `${opponent} a refusé le duel. ${challenger}, tu garderas ta mise… cette fois.`,
        );
        await collected
          .first()!
          .update({ embeds: [declined], components: [disabledRow] });
        return;
      }

      if (reason !== "accept") {
        const expired = createEmbed("warning").setDescription(
          `${opponent} n'a pas répondu à temps. Duel annulé.`,
        );
        try {
          await interaction.editReply({
            embeds: [expired],
            components: [disabledRow],
          });
        } catch {

        }
        return;
      }

      const freshOpponent = getPlayer(guildId, opponent.id);
      if (
        !removeBalance(guildId, challenger.id, stake) ||
        !removeBalance(guildId, opponent.id, stake)
      ) {
        const broke = errorEmbed(
          "Un des participants n'a plus assez de pièces. Duel annulé.",
        );
        await collected.first()!.update({ embeds: [broke], components: [disabledRow] });
        return;
      }

      const challengerLevel = getPlayer(guildId, challenger.id).level;
      const chance =
        challengerLevel / (challengerLevel + freshOpponent.level);
      const challengerWins = Math.random() < chance;

      const winner = challengerWins ? challenger : opponent;
      addBalance(guildId, winner.id, stake * 2);

      const line = WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)];
      const result = createEmbed(challengerWins ? "success" : "error")
        .setTitle("Duel terminé !")
        .setDescription(
          [
            `**${winner}** ${line} et remporte **${formatNumber(stake * 2)} ${config.currency}** !`,
            "",
            `Probabilités : ${challenger} **${Math.round(chance * 100)} %** — ${opponent} **${Math.round((1 - chance) * 100)} %**`,
          ].join("\n"),
        );

      await collected
        .first()!
        .update({ embeds: [result], components: [disabledRow] });
    });
  },
} satisfies Command;
