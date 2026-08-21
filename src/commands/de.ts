import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";
import { randomInt } from "../utils/random.js";

export default {
  data: new SlashCommandBuilder()
    .setName("de")
    .setDescription("🎲 Lance un dé à X faces")
    .addIntegerOption((option) =>
      option
        .setName("faces")
        .setDescription("Nombre de faces du dé (6 par défaut)")
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(120),
    ),

  async execute(interaction) {
    const faces = interaction.options.getInteger("faces") ?? 6;
    const roll = randomInt(1, faces);

    const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const emoji = faces === 6 ? diceEmojis[roll - 1] : "🎲";

    const embed = createEmbed()
      .setTitle(`${emoji} Lancer de dé (${faces} faces)`)
      .setDescription(
        `Tu lances le dé… il s'arrête sur **${roll}** !`,
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
