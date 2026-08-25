import "dotenv/config";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error(
    "DISCORD_TOKEN manquant !\n" +
      "   1. Copie le fichier .env.example vers .env\n" +
      "   2. Renseigne ton token : https://discord.com/developers/applications",
  );
  process.exit(1);
}

export const config = {
  token,
  clientId: process.env.CLIENT_ID ?? "",
  guildId: process.env.GUILD_ID ?? "",
  embedColor: process.env.EMBED_COLOR ?? "#5865F2",
  levelColor: process.env.LEVEL_COLOR ?? "#57F287",
  economyColor: process.env.ECONOMY_COLOR ?? "#FEE75C",
  botName: process.env.BOT_NAME ?? "OpenBot",
  currency: "coins",

  webPort: Number(process.env.WEB_PORT ?? 3000),

  publicUrl:
    process.env.PUBLIC_URL?.replace(/\/$/, "") ||
    `http://localhost:${process.env.WEB_PORT ?? 3000}`,

  cooldowns: {
    daily: 24 * 60 * 60 * 1000,
    work: 60 * 60 * 1000,
    xp: 60 * 1000,
  },

  xpPerMessage: { min: 15, max: 25 },

  // Welcome/Goodbye configuration — messages par défaut
  welcome: {
    enabled: process.env.WELCOME_ENABLED === "true",
    channelId: process.env.WELCOME_CHANNEL_ID ?? "",
    message: process.env.WELCOME_MESSAGE ?? "Bienvenue {pseudo} sur **{server_name}** !\n\nTu es notre {memberCount}ème membre — merci de nous rejoindre ! N'hésite pas à te présenter dans {channel_name}.",
  },
  goodbye: {
    enabled: process.env.GOODBYE_ENABLED === "true",
    channelId: process.env.GOODBYE_CHANNEL_ID ?? "",
    message: process.env.GOODBYE_MESSAGE ?? "Au revoir {pseudo}, on espère te revoir bientôt sur **{server_name}** !",
  },
};