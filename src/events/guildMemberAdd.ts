import { Events } from "discord.js";
import type { GuildMember } from "discord.js";
import { loadGuilds, replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberAdd;

export async function execute(member: GuildMember): Promise<void> {
  const cfg = loadGuilds().get(member.guild.id);
  if (!cfg?.welcomeChannel) return;
  const channel = member.guild.channels.cache.get(cfg.welcomeChannel);
  if (!channel || !channel.isTextBased()) return;
  const template = cfg.welcomeMessage ?? "Bienvenue {pseudo} sur {server_name} ! 🎉";
  const text = replacePlaceholders(template, {
    pseudo: member.user.username,
    mention: `<@${member.id}>`,
    serverName: member.guild.name,
    channelName: (channel as any).name ?? "",
  });
  try { await (channel as any).send(text); } catch (e) { console.error("welcome send", e); }
}
