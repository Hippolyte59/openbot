import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds, defaultAutomod } from "../database/json-db.js";
import { createEmbed } from "../utils/embeds.js";

function getCfg(guildId:string){
  const g = loadGuilds().get(guildId);
  return g?.automod ?? defaultAutomod();
}
function saveCfg(guildId:string, patch:any){
  const map = loadGuilds();
  const cur = map.get(guildId) ?? {} as any;
  const automod = { ...defaultAutomod(), ...(cur.automod ?? {}), ...patch };
  // deep merge for nested handled manually in subcommands
  map.set(guildId, { ...cur, automod });
  saveGuilds(map);
}

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("automod")
    .setDescription("Auto-Moderation")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s=>s.setName("voir").setDescription("Voir la config"))
    .addSubcommand(s=>s.setName("activer").setDescription("Activer/desactiver").addBooleanOption(o=>o.setName("etat").setDescription("active?").setRequired(true)))
    .addSubcommand(s=>s.setName("vocabulaire").setDescription("Mots interdits").addStringOption(o=>o.setName("mots").setDescription("mots separes par virgule").setRequired(true)).addStringOption(o=>o.setName("sanction").setDescription("warn/timeout/kick/ban/delete").setRequired(false)))
    .addSubcommand(s=>s.setName("liens").setDescription("Regler liens").addBooleanOption(o=>o.setName("enabled").setDescription("bloquer liens").setRequired(true)).addStringOption(o=>o.setName("allow").setDescription("domaines autorises separes par virgule").setRequired(false)))
    .addSubcommand(s=>s.setName("invitations").setDescription("Regler invitations").addBooleanOption(o=>o.setName("enabled").setDescription("bloquer invites").setRequired(true)).addStringOption(o=>o.setName("immunises").setDescription("codes ou IDs immunises separes par virgule").setRequired(false)))
    .addSubcommand(s=>s.setName("antispam").setDescription("Regler anti-spam").addIntegerOption(o=>o.setName("max_messages").setDescription("max messages /5s").setRequired(false)).addIntegerOption(o=>o.setName("max_emojis").setDescription("max emojis").setRequired(false)).addIntegerOption(o=>o.setName("max_mentions").setDescription("max mentions").setRequired(false)))
    .addSubcommand(s=>s.setName("limites").setDescription("Limites clear/save").addIntegerOption(o=>o.setName("max_clear").setDescription("max clear 1-200").setRequired(false)).addIntegerOption(o=>o.setName("max_save").setDescription("max saves par serveur").setRequired(false))),
  async execute(interaction){
    if (!interaction.inGuild()) return;
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guildId!;
    if (sub === "voir") {
      const cfg = getCfg(gid);
      await interaction.reply({ embeds:[createEmbed().setTitle("Automod").setDescription("```json\n"+JSON.stringify(cfg,null,2).slice(0,3900)+"\n```")], ephemeral:true });
      return;
    }
    if (sub === "activer") {
      const etat = interaction.options.getBoolean("etat", true);
      const cfg = getCfg(gid); cfg.enabled = etat;
      saveCfg(gid, cfg);
      await interaction.reply({ content:`Automod ${etat?"active":"desactive"}.`, ephemeral:true }); return;
    }
    if (sub === "vocabulaire") {
      const mots = interaction.options.getString("mots", true).split(",").map((s:string)=>s.trim().toLowerCase()).filter(Boolean);
      const sanction = interaction.options.getString("sanction") as any ?? "delete";
      const cfg = getCfg(gid); cfg.vocabulaire = { enabled:true, mots, sanction };
      cfg.enabled = true;
      saveCfg(gid, cfg);
      await interaction.reply({ content:`Vocabulaire: ${mots.join(", ")} -> ${sanction}`, ephemeral:true }); return;
    }
    if (sub === "liens") {
      const enabled = interaction.options.getBoolean("enabled", true);
      const allow = (interaction.options.getString("allow") ?? "").split(",").map((s:string)=>s.trim().toLowerCase()).filter(Boolean);
      const cfg = getCfg(gid); cfg.liens = { enabled, sanction:"delete", allowDomains:allow };
      cfg.enabled = true; saveCfg(gid,cfg);
      await interaction.reply({ content:`Liens ${enabled?"bloques":"autorises"} allow:${allow.join(",")||"aucun"}`, ephemeral:true }); return;
    }
    if (sub === "invitations") {
      const enabled = interaction.options.getBoolean("enabled", true);
      const imm = (interaction.options.getString("immunises") ?? "").split(",").map((s:string)=>s.trim()).filter(Boolean);
      const cfg = getCfg(gid); cfg.invitations = { enabled, sanction:"delete", immunizedGuilds: imm };
      cfg.enabled = true; saveCfg(gid,cfg);
      await interaction.reply({ content:`Invitations ${enabled?"bloquees":"autorisees"} immunises:${imm.join(",")||"aucun"}`, ephemeral:true }); return;
    }
    if (sub === "antispam") {
      const maxM = interaction.options.getInteger("max_messages");
      const maxE = interaction.options.getInteger("max_emojis");
      const maxP = interaction.options.getInteger("max_mentions");
      const cfg = getCfg(gid);
      if (maxM) cfg.antiSpam.messages = { enabled:true, max:maxM, windowMs:5000, sanction:"timeout", durationSec:60 };
      if (maxE) cfg.antiSpam.emojis = { enabled:true, max:maxE, sanction:"delete" } as any;
      if (maxP) cfg.pings = { enabled:true, maxMentions:maxP, sanction:"timeout", durationSec:60 } as any;
      cfg.enabled = true; saveCfg(gid,cfg);
      await interaction.reply({ content:`Anti-spam mis a jour.`, ephemeral:true }); return;
    }
    if (sub === "limites") {
      const maxClear = interaction.options.getInteger("max_clear");
      const maxSave = interaction.options.getInteger("max_save");
      const cfg = getCfg(gid);
      if (maxClear) cfg.maxClear = Math.max(1,Math.min(500,maxClear));
      if (maxSave) cfg.maxSave = Math.max(1,Math.min(500,maxSave));
      saveCfg(gid,cfg);
      await interaction.reply({ content:`Limites: clear ${cfg.maxClear} / save ${cfg.maxSave}`, ephemeral:true }); return;
    }
  },
} satisfies Command;
