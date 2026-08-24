import * as pkg from "discord.js";
const { SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import { loadSaved, saveSaved } from "../database/json-db.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("message")
    .setDescription("Messages sauvegardes")
    .addSubcommand(s => s.setName("sauvegarder").setDescription("Sauvegarder le contenu d'un message").addStringOption(o=>o.setName("nom").setDescription("Nom court").setRequired(true)).addStringOption(o=>o.setName("contenu").setDescription("Contenu a sauvegarder").setRequired(true)))
    .addSubcommand(s => s.setName("afficher").setDescription("Afficher un message sauvegarde").addStringOption(o=>o.setName("nom").setDescription("Nom").setRequired(true).setAutocomplete(true)))
    .addSubcommand(s => s.setName("liste").setDescription("Lister les messages sauvegardes"))
    .addSubcommand(s => s.setName("supprimer").setDescription("Supprimer un message sauvegarde").addStringOption(o=>o.setName("nom").setDescription("Nom").setRequired(true).setAutocomplete(true))),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const store = loadSaved();
    if (sub === "sauvegarder") {
      const nom = interaction.options.getString("nom", true).toLowerCase();
      const contenu = interaction.options.getString("contenu", true);
      const key = `${guildId}:${nom}`;
      if (store.has(key)) { await interaction.reply({ content: `Un message nomme \`${nom}\` existe deja.`, ephemeral:true }); return; }
      try {
        const { loadGuilds, defaultAutomod } = await import("../database/json-db.js");
        const cfg = loadGuilds().get(guildId)?.automod ?? defaultAutomod();
        const max = cfg.maxSave ?? 100;
        const count = [...store.values()].filter(m=>m.guildId===guildId).length;
        if (count >= max) { await interaction.reply({ content:`Limite atteinte: ${max} messages sauvegardes max.`, ephemeral:true }); return; }
      } catch {}
      store.set(key, { id:key, guildId, name:nom, content:contenu, authorId: interaction.user.id, createdAt: Date.now() });
      saveSaved(store);
      await interaction.reply({ embeds:[createEmbed().setTitle("Message sauvegarde").setDescription(`\`${nom}\` enregistre.`)] , ephemeral:true});
      return;
    }
    if (sub === "afficher") {
      const nom = interaction.options.getString("nom", true).toLowerCase();
      const msg = store.get(`${guildId}:${nom}`);
      if (!msg) { await interaction.reply({ content:`Aucun message \`${nom}\`.`, ephemeral:true}); return; }
      await interaction.reply({ embeds:[createEmbed().setTitle(msg.name).setDescription(msg.content).setFooter({text:`Par <@${msg.authorId}>`})] });
      return;
    }
    if (sub === "liste") {
      const list = [...store.values()].filter(m=>m.guildId===guildId);
      if (!list.length) { await interaction.reply({content:"Aucun message sauvegarde.", ephemeral:true}); return; }
      await interaction.reply({ embeds:[createEmbed().setTitle("Messages sauvegardes").setDescription(list.map(m=>`\`${m.name}\` — <@${m.authorId}>`).join("\n"))], ephemeral:true });
      return;
    }
    if (sub === "supprimer") {
      const nom = interaction.options.getString("nom", true).toLowerCase();
      const key = `${guildId}:${nom}`;
      if (!store.has(key)) { await interaction.reply({content:`Introuvable.`, ephemeral:true}); return; }
      store.delete(key); saveSaved(store);
      await interaction.reply({content:`\`${nom}\` supprime.`, ephemeral:true});
      return;
    }
  },
} satisfies Command;
