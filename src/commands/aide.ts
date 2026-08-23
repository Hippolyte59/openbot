import * as pkg from "discord.js";
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import { config } from "../config.js";
import { GITHUB_URL } from "../web/logo.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("aide")
    .setDescription("📖 Ouvre le site et le wiki du bot"),

  async execute(interaction) {
    const siteUrl = config.publicUrl;
    const wikiUrl = `${siteUrl}/wiki`;
    const logoUrl = `${siteUrl}/logo.svg`;

    const row = new (ActionRowBuilder as any)().addComponents(
      new ButtonBuilder()
        .setLabel("Site web")
        .setEmoji("🏠")
        .setStyle(ButtonStyle.Link)
        .setURL(siteUrl),
      new ButtonBuilder()
        .setLabel("Wiki — toutes les commandes")
        .setEmoji("📖")
        .setStyle(ButtonStyle.Link)
        .setURL(wikiUrl),
      new ButtonBuilder()
        .setLabel("GitHub")
        .setEmoji("🐙")
        .setStyle(ButtonStyle.Link)
        .setURL(GITHUB_URL),
    );

    await interaction.reply({
      embeds: [
        createEmbed()
          .setTitle(`📖 Aide — ${config.botName}`)
          .setThumbnail(logoUrl)
          .setDescription(
            [
              `Bienvenue ! ${config.botName} est un bot **open source** :`,
              "",
              "> 💰 Économie et niveaux",
              "> ⚔️ Aventures au tour par tour",
              "> 🐾 Animaux et mariages",
              "> 🔊 Salons vocaux personnels",
              "> 🛡️ Modération complète",
              "",
              `**Toute la documentation est sur le wiki** : les commandes y sont`,
              `classées par catégorie et **copiables en un clic**.`,
              "",
              `- Site web : ${siteUrl}`,
              `- Wiki : ${wikiUrl}`,
            ].join("\n"),
          )
          .addFields(
            {
              name: "🚀 Commencer",
              value: "`/profil`, `/quotidien`, `/aventure`, `/vocal creer`",
              inline: false,
            },
          ),
      ],
      components: [row],
    });
  },
} satisfies Command;
