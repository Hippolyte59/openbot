import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { addBalance, getPlayer, updatePlayer } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatDuration, formatNumber } from "../utils/format.js";
import { randomInt } from "../utils/random.js";
import { config } from "../config.js";

const JOBS = [
  "Tu as livré des colis à vélo",
  "Tu as servi des clients toute la journée",
  "Tu as gardé les enfants du voisin",
  "Tu as réparé des ordinateurs",
  "Tu as fait le ménage dans la mairie",
  "Tu as promené des chiens",
  "Tu as aidé à la cueillette des pommes",
  "Tu as donné des cours de maths",
];

export default {
  data: new SlashCommandBuilder()
    .setName("travail")
    .setDescription("💼 Travaille pour gagner quelques pièces"),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const player = getPlayer(interaction.guildId, interaction.user.id);
    const now = Date.now();
    const elapsed = now - player.last_work;

    if (elapsed < config.cooldowns.work) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Tu viens de travailler ! Reviens dans **${formatDuration(config.cooldowns.work - elapsed)}**.`,
          ),
        ],
      });
      return;
    }

    const salary = randomInt(60, 140);
    const job = randomInt(0, JOBS.length - 1);

    addBalance(interaction.guildId, interaction.user.id, salary);
    updatePlayer(interaction.guildId, interaction.user.id, {
      last_work: now,
    });

    const embed = createEmbed("success")
      .setTitle("💼 Fiche de paie")
      .setDescription(
        [
          `${JOBS[job]}… et tu reçois ton salaire !`,
          "",
          `💰 Salaire : **+${formatNumber(salary)} ${config.currency}**`,
        ].join("\n"),
      );

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
