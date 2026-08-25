import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds } from "../database/json-db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Rôles réactions (par message)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(s=>s.setName("ajouter").setDescription("Lier emoji → rôle sur un message")
      .addStringOption(o=>o.setName("message_id").setDescription("ID du message").setRequired(true))
      .addStringOption(o=>o.setName("emoji").setDescription("Emoji (ex: ou <:custom:123>)").setRequired(true))
      .addRoleOption(o=>o.setName("role").setDescription("Rôle à donner").setRequired(true))
      .addChannelOption(o=>o.setName("salon").setDescription("Salon du message")))
    .addSubcommand(s=>s.setName("retirer").setDescription("Retirer un emoji d'un message")
      .addStringOption(o=>o.setName("message_id").setDescription("ID du message").setRequired(true))
      .addStringOption(o=>o.setName("emoji").setDescription("Emoji").setRequired(true)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister les rôles réactions"))
    .addSubcommand(s=>s.setName("clear").setDescription("Vider un message")
      .addStringOption(o=>o.setName("message_id").setDescription("ID du message").setRequired(true))),
  async execute(interaction:any){
    if(!interaction.inGuild()) return;
    const sub=interaction.options.getSubcommand();
    const guildId=interaction.guildId!;
    const guilds=loadGuilds();
    const cfg:any = guilds.get(guildId) ?? {};
    cfg.reactionRoles = cfg.reactionRoles ?? {};

    if(sub==="ajouter"){
      const messageId=interaction.options.getString("message_id",true);
      const emojiRaw=interaction.options.getString("emoji",true).trim();
      const role=interaction.options.getRole("role",true);
      const channelOpt=interaction.options.getChannel("salon");
      const channel = channelOpt ?? interaction.channel;
      if(!role.editable) return interaction.reply({content:"Je ne peux pas gérer ce rôle (hiérarchie).", ephemeral:true});
      // try to add reaction to message
      try{
        const msg = await (channel as any).messages.fetch(messageId).catch(()=>null);
        if(!msg) return interaction.reply({content:"Message introuvable dans ce salon. Vérifie l'ID et le salon.", ephemeral:true});
        await msg.react(emojiRaw).catch(()=>{});
      }catch{}
      cfg.reactionRoles[messageId] = cfg.reactionRoles[messageId] ?? {};
      const key = emojiRaw; // store raw for lookup; normalisation done in event
      cfg.reactionRoles[messageId][key]=role.id;
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`${emojiRaw} → ${role} sur message \`${messageId}\``, ephemeral:true});
    }
    if(sub==="retirer"){
      const messageId=interaction.options.getString("message_id",true);
      const emojiRaw=interaction.options.getString("emoji",true).trim();
      if(!cfg.reactionRoles[messageId]) return interaction.reply({content:"Aucune config pour ce message.", ephemeral:true});
      delete cfg.reactionRoles[messageId][emojiRaw];
      // also try delete without variation selectors
      for(const k of Object.keys(cfg.reactionRoles[messageId])){ if(k===emojiRaw) delete cfg.reactionRoles[messageId][k]; }
      if(!Object.keys(cfg.reactionRoles[messageId]).length) delete cfg.reactionRoles[messageId];
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`Retiré ${emojiRaw} du message \`${messageId}\``, ephemeral:true});
    }
    if(sub==="liste"){
      const entries=Object.entries(cfg.reactionRoles as Record<string,Record<string,string>>);
      if(!entries.length) return interaction.reply({content:"Aucun rôle réaction configuré.", ephemeral:true});
      const lines=entries.map(([mid, map])=>{
        const pairs=Object.entries(map).map(([e,r])=>`${e}→<@&${r}>`).join(" | ");
        return `• \`${mid}\` : ${pairs}`;
      }).join("\n");
      return interaction.reply({content:lines.slice(0,1900), ephemeral:true});
    }
    if(sub==="clear"){
      const messageId=interaction.options.getString("message_id",true);
      delete cfg.reactionRoles[messageId];
      guilds.set(guildId,cfg); saveGuilds(guilds);
      return interaction.reply({content:`Config du message \`${messageId}\` vidée.`, ephemeral:true});
    }
  }
} satisfies Command;
