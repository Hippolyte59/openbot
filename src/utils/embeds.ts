import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";

export type EmbedColor = "primary" | "success" | "error" | "warning";

const colors: Record<EmbedColor, number> = {
  primary: parseInt(config.embedColor.replace("#", ""), 16) || 0x5865f2,
  success: 0x57f287,
  error: 0xed4245,
  warning: 0xfee75c,
};

export function createEmbed(color: EmbedColor = "primary"): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(colors[color])
    .setFooter({ text: `• ${config.botName}` })
    .setTimestamp();
}

export function errorEmbed(description: string): EmbedBuilder {
  return createEmbed("error").setDescription(`❌ ${description}`);
}

export function successEmbed(description: string): EmbedBuilder {
  return createEmbed("success").setDescription(`✅ ${description}`);
}
