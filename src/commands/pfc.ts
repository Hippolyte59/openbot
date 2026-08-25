import * as pkg from "discord.js";
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";

const CHOICES = [
  { id: "pierre", label: "Pierre", emoji: "", beats: "ciseaux" },
  { id: "papier", label: "Papier", emoji: "", beats: "pierre" },
  { id: "ciseaux", label: "Ciseaux", emoji: "", beats: "papier" },
] as const;

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("pfc")
    .setDescription("Pierre-feuille-ciseaux contre le bot"),

  async execute(interaction) {
    const userId = interaction.user.id;

    const row = new (ActionRowBuilder as any)().addComponents(
      ...CHOICES.map(
        (choice) =>
          new ButtonBuilder()
            .setCustomId(`pfc:${userId}:${choice.id}`)
            .setLabel(choice.label)
            .setEmoji(choice.emoji)
            .setStyle(ButtonStyle.Primary),
      ),
    );

    const embed = createEmbed()
      .setTitle("Papier-ciseaux… euh, pierre-feuille-ciseaux !")
      .setDescription("Fais ton choix, je joue en même temps que toi.");

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    collector.on("collect", async (button) => {
      const [, ownerId, choiceId] = button.customId.split(":");
      if (ownerId !== userId) {
        await button.reply({
          content: "Cette partie n'est pas la tienne, lance ta propre /pfc !",
          ephemeral: true,
        });
        return;
      }

      const playerChoice =
        CHOICES.find((c) => c.id === choiceId) ?? CHOICES[0];
      const botChoice =
        CHOICES[Math.floor(Math.random() * CHOICES.length)];

      let outcome: string;
      if (playerChoice.id === botChoice.id) {
        outcome = `**Égalité !** Nous avons tous les deux joué ${playerChoice.emoji} ${playerChoice.label}.`;
      } else if (
        CHOICES.find((c) => c.id === playerChoice.id)?.beats ===
        botChoice.id
      ) {
        outcome = `**Tu gagnes !** Ton ${playerChoice.emoji} ${playerChoice.label} bat mon ${botChoice.emoji} ${botChoice.label}.`;
      } else {
        outcome = `**Je gagne !** Mon ${botChoice.emoji} ${botChoice.label} bat ton ${playerChoice.emoji} ${playerChoice.label}.`;
      }

      const disabledRow =
        new (ActionRowBuilder as any)().addComponents(
          ...row.components.map((c) =>
            ButtonBuilder.from(c).setDisabled(true),
          ),
        );

      await button.update({
        embeds: [
          createEmbed()
            .setTitle("Pierre-feuille-ciseaux")
            .setDescription(
              [
                `Toi : ${playerChoice.emoji} — Moi : ${botChoice.emoji}`,
                "",
                outcome,
              ].join("\n"),
            ),
        ],
        components: [disabledRow],
      });
      collector.stop();
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "time") {
        try {
          await interaction.editReply({
            embeds: [
              createEmbed("warning").setDescription(
                "Trop de réflexion ! Partie expirée.",
              ),
            ],
            components: [],
          });
        } catch {

        }
      }
    });
  },
} satisfies Command;
