import type { Message } from "discord.js";
import { getInterserversByChannel } from "../database/interserver.js";

export async function handleInterserverMessage(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.guildId || !message.channelId) return;

  const interservers = getInterserversByChannel(message.channelId);
  if (interservers.length === 0) return;

  for (const interserver of interservers) {
    for (const link of interserver.guilds) {
      if (link.channelId === message.channelId) continue;
      try {
        const guild = message.client.guilds.cache.get(link.guildId);
        const channel: any = guild?.channels.cache.get(link.channelId);
        if (!channel?.isTextBased()) continue;

        const content = `**[${message.guild?.name ?? "Serveur"}]** ${message.author.username}: ${message.content.slice(0, 1900)}`;
        const files = [...message.attachments.values()].map(a => a.url);

        if (files.length) {
          await channel.send({ content, files } as any);
        } else if (message.content) {
          await channel.send(content);
        }
      } catch {}
    }
  }
}
