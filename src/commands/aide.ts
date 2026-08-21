import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { asBotClient } from "../types.js";
import { createEmbed } from "../utils/embeds.js";
import { config } from "../config.js";

/** Regroupement des commandes par catégorie pour l'affichage. */
const GROUPS: Array<{ title: string; commands: string[] }> = [
  { title: "👤 Profil & classement", commands: ["profil", "classement"] },
  {
    title: "💰 Économie",
    commands: [
      "quotidien",
      "travail",
      "parier",
      "donner",
      "boutique",
      "acheter",
      "inventaire",
      "utiliser",
    ],
  },
  { title: "⚔️ Aventure & communauté", commands: ["aventure", "duel", "pfc", "sondage"] },
  { title: "🎲 Mini-jeux", commands: ["piece", "de", "8ball"] },
  { title: "🔐 Administration", commands: ["admin"] },
  { title: "🛠️ Utilitaires", commands: ["ping", "aide"] },
];

export default {
  data: new SlashCommandBuilder()
    .setName("aide")
    .setDescription("📖 Affiche la liste de toutes les commandes"),

  async execute(interaction) {
    const registered = asBotClient(interaction.client).commands;
    const embed = createEmbed()
      .setTitle(`📖 Commandes de ${config.botName}`)
      .setDescription(
        [
          `Bienvenue ! ${config.botName} est un bot **open source** : économie, niveaux, boutique, aventures et mini-jeux.`,
          "",
          "Voici toutes les commandes disponibles :",
        ].join("\n"),
      );

    const listed = new Set<string>();

    for (const group of GROUPS) {
      const lines = group.commands
        .map((name) => registered.get(name))
        .filter((cmd): cmd is Command => cmd !== undefined)
        .map((cmd) => {
          listed.add(cmd.data.name);
          return `\`/${cmd.data.name}\` — ${cmd.data.description.replace(/^[^\wÀ-ÿ]+ /u, "")}`;
        });

      if (lines.length > 0) {
        embed.addFields({ name: group.title, value: lines.join("\n") });
      }
    }

    // Commandes non répertoriées (ex. ajoutées par un contributeur)
    const others = [...registered.values()]
      .filter((cmd) => !listed.has(cmd.data.name))
      .map((cmd) => `\`/${cmd.data.name}\` — ${cmd.data.description}`);

    if (others.length > 0) {
      embed.addFields({ name: "📌 Autres", value: others.join("\n") });
    }

    embed.addFields({
      name: "🔐 Administration",
      value:
        "`/admin` est réservé aux administrateurs et aux rôles configurés avec `/admin roles ajouter`.",
    });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
