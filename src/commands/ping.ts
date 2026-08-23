import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("ping")
    .setDescription("🏓 Affiche la latence du bot"),

  async execute(interaction) {
    await interaction.deferReply();

    const wsPing = Math.max(0, Math.round(interaction.client.ws.ping));
    const embed = createEmbed()
      .setTitle("🏓 Pong !")
      .addFields(
        {
          name: "📡 Latence WebSocket",
          value: `\`${wsPing} ms\``,
          inline: true,
        },
        {
          name: "💬 Latence API",
          value: `\`${Date.now() - interaction.createdTimestamp} ms\``,
          inline: true,
        },
      );

    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Command;
