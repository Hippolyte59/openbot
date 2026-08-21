import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("piece")
    .setDescription("🪙 Lance une pièce (pile ou face)"),

  async execute(interaction) {
    await interaction.deferReply();

    const result = Math.random() < 0.5 ? "**Pile** 🪙" : "**Face** 🎯";

    const embed = createEmbed()
      .setTitle("🪙 Pile ou face")
      .setDescription(`La pièce tourne, tourne… et c'est : ${result} !`);

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
