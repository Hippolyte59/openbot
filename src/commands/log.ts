import * as pkg from "discord.js";
const { SlashCommandBuilder, EmbedBuilder } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds } from "../database/json-db.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("log")
    .setDescription("Poster un message dans les logs personnalisés")
    .addStringOption((opt) => opt.setName("service").setDescription("Service").setRequired(true).addChoices(
      { name: "YouTube", value: "youtube" },
      { name: "Twitch", value: "twitch" },
      { name: "Reddit", value: "reddit" },
      { name: "Dealabs", value: "dealabs" },
    ))
    .addStringOption((opt) => opt.setName("titre").setDescription("Titre du log").setRequired(true))
    .addStringOption((opt) => opt.setName("description").setDescription("Description").setRequired(true)),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const guildId = interaction.guildId;
    const service = interaction.options.getString("service")!;
    const titre = interaction.options.getString("titre")!;
    const description = interaction.options.getString("description")!;
    const cfg = loadGuilds().get(guildId) || {};
    const logs = cfg.logs ?? {};

    const serviceConfig = logs[asService(service)];
    if (!serviceConfig?.channelId) {
      await interaction.reply({ content: `Salon de logs non configuré pour **${service}**. Utilise le panneau admin.`, ephemeral: true });
      return;
    }

    const channel = interaction.guild.channels.cache.get(serviceConfig.channelId);
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: "Salon introuvable.", ephemeral: true });
      return;
    }

    const color = serviceConfig.color ?? "#0099ff";
    const avatarUrl = serviceConfig.avatarUrl ?? interaction.client.user?.displayAvatarURL() ?? "";

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${service.toUpperCase()}`)
      .setDescription(`**${titre}**\n${description}`)
      .setThumbnail(avatarUrl)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `Log ${service} posté dans ${channel}.`, ephemeral: true });
  },
};

function asService(s: string): "youtube" | "twitch" | "reddit" | "dealabs" {
  switch (s) {
    case "youtube": return "youtube";
    case "twitch": return "twitch";
    case "reddit": return "reddit";
    case "dealabs": return "dealabs";
    default: return "youtube";
  }
}