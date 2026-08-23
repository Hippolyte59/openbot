import { Events } from "discord.js";
import type { GuildMember } from "discord.js";
import { loadGuilds, replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberAdd;

export async function execute(member: any): Promise<void> {
  const cfg = loadGuilds().get(member.guild.id);
  if (!cfg?.welcomeChannel) return;
  const channel = member.guild.channels.cache.get(cfg.welcomeChannel);
  if (!channel || !channel.isTextBased()) return;
  const template = cfg.welcomeMessage ?? "🎉 Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}.";
  const text = replacePlaceholders(template, {
    pseudo: member.user.username,
    mention: `<@${member.id}>`,
    serverName: member.guild.name,
    channelName: (channel as any).name ?? "",
    memberCount: member.guild.memberCount,
  });
  const payload: any = { content: text };
  if (cfg.welcomeBanner) payload.embeds = [{ image: { url: cfg.welcomeBanner }, color: 0x5865F2 }];
  try { await (channel as any).send(payload); } catch (e) { console.error("welcome send", e); }
}
