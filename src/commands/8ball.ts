import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";
import { pick } from "../utils/random.js";

const ANSWERS = [
  "C'est certain.",
  "Sans aucun doute.",
  "Oui, clairement.",
  "Les signes pointent vers oui.",
  "Compte là-dessus.",
  "Réfléchis et redemande.",
  "Mieux vaut ne pas te le dire maintenant.",
  "Impossible de prédire ça.",
  "N'y compte pas.",
  "Ma source dit non.",
  "Perspective pas terrible…",
  "Très douteux.",
];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("8ball")
    .setDescription("Pose une question au bot magique")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Ta question oui/non")
        .setRequired(true)
        .setMaxLength(200),
    ),

  async execute(interaction) {
    const question = interaction.options.getString("question", true);

    const embed = createEmbed()
      .setTitle("Boule magique")
      .addFields(
        { name: "Question", value: question },
        {
          name: "Réponse",
          value: `*${pick(ANSWERS)}*`,
        },
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
