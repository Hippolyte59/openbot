import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";

const POLL_EMOJIS = ["1", "2", "3", "4"];

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("sondage")
    .setDescription("Lance un sondage dans le salon")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("La question du sondage")
        .setRequired(true)
        .setMaxLength(200),
    )
    .addStringOption((option) =>
      option
        .setName("choix1")
        .setDescription("Premier choix (2 à 4 choix pour un sondage à options)")
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("choix2")
        .setDescription("Deuxième choix")
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("choix3")
        .setDescription("Troisième choix")
        .setMaxLength(50),
    )
    .addStringOption((option) =>
      option
        .setName("choix4")
        .setDescription("Quatrième choix")
        .setMaxLength(50),
    ),

  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    const choices = [
      interaction.options.getString("choix1"),
      interaction.options.getString("choix2"),
      interaction.options.getString("choix3"),
      interaction.options.getString("choix4"),
    ].filter((c): c is string => c !== null);

    if (choices.length === 1) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Pour un sondage à options, donne au moins 2 choix — ou aucun pour un vote /.",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (choices.length === 0) {
      const embed = createEmbed()
        .setTitle("Sondage")
        .setDescription(
          `**${question}**\n\n_Vote avec les réactions ci-dessous._`,
        )
        .setFooter({
          text: `Sondage lancé par ${interaction.user.username}`,
        });

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      await message.react("");
      await message.react("");
      return;
    }

    const lines = choices.map(
      (choice, index) => `${POLL_EMOJIS[index]} ${choice}`,
    );

    const embed = createEmbed()
      .setTitle("Sondage")
      .setDescription(
        `**${question}**\n\n${lines.join("\n")}\n\n_Vote avec les réactions ci-dessous._`,
      )
      .setFooter({
        text: `Sondage lancé par ${interaction.user.username}`,
      });

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < choices.length; i++) {
      await message.react(POLL_EMOJIS[i]);
    }
  },
} satisfies Command;
