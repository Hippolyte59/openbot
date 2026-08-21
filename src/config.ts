import "dotenv/config";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error(
    "❌ DISCORD_TOKEN manquant !\n" +
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
  botName: process.env.BOT_NAME ?? "OpenBot",
  currency: "🪙",

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
};
