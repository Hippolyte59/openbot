import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds } from "../database/json-db.js";

function sanitizeName(n: string){ return n.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0,32); }

export default {
  data: new SlashCommandBuilder()
    .setName("custom")
    .setDescription("Commandes personnalisées")
    .addSubcommand(s=>s.setName("creer").setDescription("Créer une commande personnalisée")
      .addStringOption(o=>o.setName("nom").setDescription("Nom sans espace (ex: bonjour)").setRequired(true))
      .addStringOption(o=>o.setName("reponse").setDescription("Réponse (placeholders: {pseudo} {mention} {user} {server_name})").setRequired(true))
      .addStringOption(o=>o.setName("description").setDescription("Description courte")))
    .addSubcommand(s=>s.setName("supprimer").setDescription("Supprimer une commande")
      .addStringOption(o=>o.setName("nom").setDescription("Nom").setRequired(true).setAutocomplete(true)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister les commandes personnalisées"))
    .addSubcommand(s=>s.setName("voir").setDescription("Voir une commande")
      .addStringOption(o=>o.setName("nom").setDescription("Nom").setRequired(true).setAutocomplete(true))),
  async execute(interaction:any){
    if(!interaction.inGuild()) return;
    const guildId=interaction.guildId!;
    const sub=interaction.options.getSubcommand();
    const guilds=loadGuilds();
    const cfg:any = guilds.get(guildId) ?? {};
    cfg.customCommands = cfg.customCommands ?? {};

    if(sub==="creer"){
      if(!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({content:"Besoin de **Gérer le serveur**.", ephemeral:true});
      const raw=interaction.options.getString("nom",true);
      const name=sanitizeName(raw);
      if(!name) return interaction.reply({content:"Nom invalide.", ephemeral:true});
      if(cfg.customCommands[name]) return interaction.reply({content:`La commande \`${name}\` existe déjà. Supprime-la d'abord.`, ephemeral:true});
      const response=interaction.options.getString("reponse",true);
      const description=interaction.options.getString("description") ?? "";
      if(response.length>1800) return interaction.reply({content:"Réponse trop longue (max 1800).", ephemeral:true});
      cfg.customCommands[name]={ response, description, allowMentions:true, createdAt:Date.now() };
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`Commande personnalisée \`!${name}\` créée → \`${response.slice(0,120)}\` — mentions supportées: {mention} {pseudo} {user}.`, ephemeral:true});
    }
    if(sub==="supprimer"){
      const name=sanitizeName(interaction.options.getString("nom",true));
      if(!cfg.customCommands[name]) return interaction.reply({content:"Commande introuvable.", ephemeral:true});
      delete cfg.customCommands[name];
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`Commande \`!${name}\` supprimée.`, ephemeral:true});
    }
    if(sub==="liste"){
      const keys=Object.keys(cfg.customCommands);
      if(!keys.length) return interaction.reply({content:"Aucune commande personnalisée. Crée avec `/custom creer`.", ephemeral:true});
      const lines=keys.map(k=>{
        const c=cfg.customCommands[k];
        const mentionHint = c.response.includes("{mention}")||c.response.includes("{user}") ? " • mentions" : "";
        return `• \`!${k}\` — ${c.description||c.response.slice(0,60)}${mentionHint}`;
      }).join("\n");
      return interaction.reply({content:lines, ephemeral:true});
    }
    if(sub==="voir"){
      const name=sanitizeName(interaction.options.getString("nom",true));
      const c=cfg.customCommands[name];
      if(!c) return interaction.reply({content:"Introuvable.", ephemeral:true});
      return interaction.reply({content:`**!${name}**\n\`\`\`${c.response}\`\`\`\nPlaceholders: {pseudo} {mention} {user} {server_name} {channel_name} {memberCount}`, ephemeral:true});
    }
  }
} satisfies Command;
