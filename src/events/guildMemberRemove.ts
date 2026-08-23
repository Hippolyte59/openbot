import { Events } from "discord.js";
import type { GuildMember } from "discord.js";
import { loadGuilds, replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberRemove;

export async function execute(member: any): Promise<void> {
  const cfg = loadGuilds().get(member.guild.id);
  if (!cfg?.goodbyeChannel) return;
  const channel = member.guild.channels.cache.get(cfg.goodbyeChannel);
  if (!channel || !channel.isTextBased()) return;
  const template = cfg.goodbyeMessage ?? "👋 Au revoir {pseudo}, on espère te revoir bientôt sur **{server_name}** !";
  const text = replacePlaceholders(template, {
    pseudo: member.user.username,
    mention: `<@${member.id}>`,
    serverName: member.guild.name,
    channelName: (channel as any).name ?? "",
    memberCount: member.guild.memberCount,
  });
  const payload: any = { content: text };
  if ((cfg as any).goodbyeBanner) payload.embeds = [{ image: { url: (cfg as any).goodbyeBanner }, color: 0xED4245 }];
  try { await (channel as any).send(payload); } catch (e) { console.error("goodbye send", e); }
}
