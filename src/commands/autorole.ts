import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds } from "../database/json-db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Rôles automatiques à l'arrivée")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(s => s.setName("ajouter").setDescription("Ajouter un rôle auto")
      .addRoleOption(o=>o.setName("role").setDescription("Rôle à donner à l'arrivée").setRequired(true)))
    .addSubcommand(s => s.setName("retirer").setDescription("Retirer un rôle auto")
      .addRoleOption(o=>o.setName("role").setDescription("Rôle").setRequired(true)))
    .addSubcommand(s => s.setName("liste").setDescription("Lister les rôles automatiques"))
    .addSubcommand(s => s.setName("clear").setDescription("Vider tous les rôles auto")),
  async execute(interaction:any){
    if(!interaction.inGuild()) return;
    const guildId=interaction.guildId!;
    const sub=interaction.options.getSubcommand();
    const guilds=loadGuilds();
    const cfg: any = guilds.get(guildId) ?? {};
    cfg.autoRoles = cfg.autoRoles ?? [];
    if(sub==="ajouter"){
      const role=interaction.options.getRole("role",true);
      if(cfg.autoRoles.includes(role.id)) return interaction.reply({content:`Le rôle ${role} est déjà en auto.`, ephemeral:true});
      if(!role.editable) return interaction.reply({content:`Je ne peux pas gérer ${role} (hiérarchie).`, ephemeral:true});
      cfg.autoRoles.push(role.id);
      guilds.set(guildId, cfg); saveGuilds(guilds);
      return interaction.reply({content:`${role} sera donné automatiquement à l'arrivée.`, ephemeral:false});
    }
    if(sub==="retirer"){
      const role=interaction.options.getRole("role",true);
      cfg.autoRoles = cfg.autoRoles.filter((id:string)=>id!==role.id);
      guilds.set(guildId, cfg); saveGuilds(guilds);
      return interaction.reply({content:`${role} retiré des rôles automatiques.`, ephemeral:true});
    }
    if(sub==="liste"){
      if(!cfg.autoRoles.length) return interaction.reply({content:"Aucun rôle automatique configuré.", ephemeral:true});
      return interaction.reply({content:`Rôles auto: ${cfg.autoRoles.map((id:string)=>`<@&${id}>`).join(", ")}`, ephemeral:true});
    }
    if(sub==="clear"){
      cfg.autoRoles=[];
      guilds.set(guildId, cfg); saveGuilds(guilds);
      return interaction.reply({content:"Rôles automatiques vidés.", ephemeral:true});
    }
  }
} satisfies Command;
