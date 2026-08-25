import { EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { loadGuilds } from "../database/json-db.js";

export type EmbedColor = "primary" | "success" | "error" | "warning" | "level" | "economy";

function hexToInt(hex: string, fallback: number): number {
  const v = parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(v) ? fallback : v;
}

function guildColors(guildId?: string): { primary: number; level: number; economy: number; success: number; warning: number; error: number } {
  const g = guildId ? loadGuilds().get(guildId) : undefined;
  const level = hexToInt(g?.levelColor ?? (config as any).levelColor ?? "#57F287", 0x57f287);
  const economy = hexToInt(g?.economyColor ?? (config as any).economyColor ?? "#FEE75C", 0xfee75c);
  const primary = hexToInt(g?.embedColor ?? config.embedColor, 0x5865f2);
  return { primary, level, economy, success: level, warning: economy, error: 0xed4245 };
}

const colors: Record<EmbedColor, number> = {
  primary: hexToInt(config.embedColor, 0x5865f2),
  success: hexToInt((config as any).levelColor ?? "#57F287", 0x57f287),
  error: 0xed4245,
  warning: hexToInt((config as any).economyColor ?? "#FEE75C", 0xfee75c),
  level: hexToInt((config as any).levelColor ?? "#57F287", 0x57f287),
  economy: hexToInt((config as any).economyColor ?? "#FEE75C", 0xfee75c),
};

export function createEmbed(color: EmbedColor = "primary", guildId?: string): any {
  const c = guildId ? guildColors(guildId)[color as keyof ReturnType<typeof guildColors>] ?? colors[color] : colors[color];
  return new (EmbedBuilder as any)()
    .setColor(c)
    .setFooter({ text: `• ${config.botName}` })
    .setTimestamp();
}
export function levelEmbed(description: string, guildId?: string): any { return createEmbed("level", guildId).setDescription(description); }
export function economyEmbed(description: string, guildId?: string): any { return createEmbed("economy", guildId).setDescription(description); }

export function errorEmbed(description: string): any {
  return createEmbed("error").setDescription(`${description}`);
}

export function successEmbed(description: string): any {
  return createEmbed("success").setDescription(`${description}`);
}
