import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds } from "../database/json-db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("wordreact")
    .setDescription("Réactions de mots")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(s=>s.setName("ajouter").setDescription("Ajouter une réaction sur un mot")
      .addStringOption(o=>o.setName("mot").setDescription("Mot déclencheur (minuscule)").setRequired(true))
      .addStringOption(o=>o.setName("emoji").setDescription("Emoji à réagir").setRequired(true)))
    .addSubcommand(s=>s.setName("retirer").setDescription("Retirer un mot")
      .addStringOption(o=>o.setName("mot").setDescription("Mot").setRequired(true)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister les mots"))
    .addSubcommand(s=>s.setName("clear").setDescription("Vider tous les mots")),
  async execute(interaction:any){
    if(!interaction.inGuild()) return;
    const sub=interaction.options.getSubcommand();
    const guildId=interaction.guildId!;
    const guilds=loadGuilds();
    const cfg:any = guilds.get(guildId) ?? {};
    cfg.wordReactions = cfg.wordReactions ?? {};
    if(sub==="ajouter"){
      const mot=interaction.options.getString("mot",true).toLowerCase().trim();
      const emoji=interaction.options.getString("emoji",true).trim();
      if(mot.length<2||mot.length>32) return interaction.reply({content:"Mot entre 2 et 32 caractères.", ephemeral:true});
      cfg.wordReactions[mot]=emoji;
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`✅ Quand quelqu'un écrit \`${mot}\` → réaction ${emoji}`, ephemeral:true});
    }
    if(sub==="retirer"){
      const mot=interaction.options.getString("mot",true).toLowerCase().trim();
      if(!cfg.wordReactions[mot]) return interaction.reply({content:"Mot introuvable.", ephemeral:true});
      delete cfg.wordReactions[mot];
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`🗑️ \`${mot}\` retiré.`, ephemeral:true});
    }
    if(sub==="liste"){
      const entries=Object.entries(cfg.wordReactions as Record<string,string>);
      if(!entries.length) return interaction.reply({content:"Aucune réaction de mot.", ephemeral:true});
      return interaction.reply({content:entries.map(([w,e])=>`• \`${w}\` → ${e}`).join("\n"), ephemeral:true});
    }
    if(sub==="clear"){
      cfg.wordReactions={};
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:"✅ Réactions de mots vidées.", ephemeral:true});
    }
  }
} satisfies Command;
