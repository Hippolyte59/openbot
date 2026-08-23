import { Events, type Client, type GatewayIntentBits } from "discord.js";
import { replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberRemove;

export async function execute(member: import("discord.js").GuildMember): Promise<void> {
  const guildConfig = await import("../database/json-db.js").then((mod) => mod.loadGuilds().get(member.guild.id)) || {};
  
  const goodbyeChannelId = guildConfig.goodbyeChannel;
  const goodbyeMessage = guildConfig.goodbyeMessage || "Au revoir {pseudo} ! On espère te revoir bientôt sur {server_name}.";
  
  if (!goodbyeChannelId) return;

  const channel = member.guild.channels.cache.get(goodbyeChannelId);
  if (!channel) return;

  const pseudo = member.user?.displayName || member.user?.username;
  const mention = member.toString();
  const serverName = member.guild.name;

  const data = {
    pseudo,
    mention,
    serverName,
  };

  const finalMessage = replacePlaceholders(goodbyeMessage, data);

  try {
    await channel.send({ content: finalMessage });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message d'adieu :", error);
  }
}