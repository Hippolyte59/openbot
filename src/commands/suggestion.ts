import * as pkg from "discord.js";
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = pkg as any;
import type { Command } from "../types.js";
import { loadSuggestions, saveSuggestions } from "../database/json-db.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("suggestion")
    .setDescription("Suggestions communautaires")
    .addSubcommand(s=>s.setName("proposer").setDescription("Proposer une suggestion").addStringOption(o=>o.setName("texte").setDescription("Contenu").setRequired(true)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister les suggestions")),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    if (sub === "proposer") {
      const texte = interaction.options.getString("texte", true);
      const store = loadSuggestions();
      const id = `${guildId}:${Date.now().toString(36)}`;
      store.set(id, { id, guildId, authorId: interaction.user.id, content: texte, up:0, down:0, voters:{}, createdAt: Date.now() });
      saveSuggestions(store);
      const row:any = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`sugg:up:${id}`).setLabel("Pour 0").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`sugg:down:${id}`).setLabel("Contre 0").setStyle(ButtonStyle.Danger),
      );
      await interaction.reply({ embeds:[createEmbed().setTitle("Suggestion").setDescription(texte).setFooter({text:`Proposee par ${interaction.user.tag}`})], components:[row] });
      return;
    }
    if (sub === "liste") {
      const list = [...loadSuggestions().values()].filter(s=>s.guildId===guildId).slice(-10);
      if (!list.length) { await interaction.reply({content:"Aucune suggestion.", ephemeral:true}); return; }
      await interaction.reply({ embeds:[createEmbed().setTitle("Suggestions").setDescription(list.map(s=>`**${s.id.split(":")[1]}** — ${s.content.slice(0,80)} — ${s.up} / ${s.down}`).join("\n"))], ephemeral:true });
      return;
    }
  },
} satisfies Command;
