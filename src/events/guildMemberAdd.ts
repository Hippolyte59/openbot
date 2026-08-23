import { Events, type Client } from "discord.js";
import { replacePlaceholders } from "../database/json-db.js";

export const name = Events.GuildMemberAdd;

export async function execute(member: import("discord.js").GuildMember): Promise<void> {
  // Charge la config du serveur
  const { loadGuilds } = await import("../database/json-db.js");
  const guildConfig = loadGuilds().get(member.guild.id) || {};
  
  const welcomeChannelId = guildConfig.welcomeChannel;
  const welcomeMessage = guildConfig.welcomeMessage || "Bienvenue {pseudo} sur {server_name} !";
  
  if (!welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const pseudo = member.user?.displayName || member.user?.username;
  const mention = member.toString();
  const serverName = member.guild.name;

  const data = {
    pseudo,
    mention,
    serverName,
    channelName: channel.name,
  };

  const finalMessage = replacePlaceholders(welcomeMessage, data);

  try {
    await channel.send({ content: finalMessage });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message de bienvenue :", error);
  }
}