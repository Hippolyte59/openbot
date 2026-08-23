import { Events } from "discord.js";
import type { GuildMember } from "discord.js";
import { loadGuilds, replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberRemove;

export async function execute(member: GuildMember): Promise<void> {
  const cfg = loadGuilds().get(member.guild.id);
  if (!cfg?.goodbyeChannel) return;
  const channel = member.guild.channels.cache.get(cfg.goodbyeChannel);
  if (!channel || !channel.isTextBased()) return;
  const template = cfg.goodbyeMessage ?? "Au revoir {pseudo} ! 👋";
  const text = replacePlaceholders(template, {
    pseudo: member.user.username,
    mention: `<@${member.id}>`,
    serverName: member.guild.name,
    channelName: (channel as any).name ?? "",
  });
  try { await (channel as any).send(text); } catch (e) { console.error("goodbye send", e); }
}
