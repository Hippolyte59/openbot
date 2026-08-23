import { Events } from "discord.js";
import type { GuildMember } from "discord.js";
import { loadGuilds, loadBirthdays, replacePlaceholders } from "../database/json-db.js";

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
  const embed: any = {
    color: 0x5865F2,
    description: text,
    thumbnail: { url: member.user.displayAvatarURL({ size: 256 } as any) ?? undefined },
    footer: { text: `${member.guild.name} • Membre #${member.guild.memberCount}`, icon_url: member.guild.iconURL() ?? undefined },
    timestamp: new Date().toISOString(),
  };
  if (cfg.welcomeBanner) embed.image = { url: cfg.welcomeBanner };
  const payload: any = { content: `<@${member.id}>`, embeds: [embed], allowedMentions: { parse: ["users"] } };
  try { await (channel as any).send(payload); } catch (e) { console.error("welcome send", e); }

  // Birthday check
  const bday = loadBirthdays()[`${member.guild.id}:${member.id}`];
  if (bday && cfg.birthdayChannelId && cfg.birthdayMessage) {
    const bdayChannel = member.guild.channels.cache.get(cfg.birthdayChannelId);
    if (bdayChannel && bdayChannel.isTextBased()) {
      const age = Math.floor((Date.now() - member.user.createdAt) / 86400000) / 30.44 | 0; // rough age
      const bdayText = cfg.birthdayMessage
        .replace(/{pseudo}/g, member.user.username)
        .replace(/{age}/g, age.toString())
        .replace(/{date}/g, `${bday.month}/${bday.day}`);
      try { await bdayChannel.send({ content: `<@${member.id}>`, embeds: [{ color: 0xFFD700, description: bdayText }] }); } catch {}
    }
  }
}
