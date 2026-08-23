import * as pkg from "discord.js";
const { SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";
import { createEvent, getAllEvents, cancelEvent, formatDuration } from "../systems/scheduler.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rappel")
    .setDescription("Gère les rappels (plusieurs simultanés)")
    .addSubcommand(s=>s.setName("creer").setDescription("Créer un rappel")
      .addStringOption(o=>o.setName("titre").setDescription("Titre du rappel").setRequired(true))
      .addIntegerOption(o=>o.setName("duree").setDescription("Dans combien de minutes ?").setRequired(true).setMinValue(1).setMaxValue(10080))
      .addStringOption(o=>o.setName("message").setDescription("Message du rappel")))
    .addSubcommand(s=>s.setName("lister").setDescription("Lister tes rappels en cours"))
    .addSubcommand(s=>s.setName("annuler").setDescription("Annuler un rappel")
      .addStringOption(o=>o.setName("id").setDescription("ID du rappel").setRequired(true))),

  async execute(interaction: any){
    if(!interaction.inGuild()) return;
    const sub=interaction.options.getSubcommand();
    const guildId=interaction.guildId!;
    const channelId=interaction.channelId!;

    if(sub==="creer"){
      const titre=interaction.options.getString("titre",true);
      const duree=interaction.options.getInteger("duree",true);
      const message=interaction.options.getString("message") ?? titre;
      const endsAt=Date.now()+duree*60*1000;
      const ev=createEvent({ guildId, channelId, type:"reminder", title:titre, description: message, createdBy: interaction.user.id, endsAt });
      return interaction.reply({ content: `⏰ Rappel **${titre}** créé ! ID \`${ev.id}\` • Dans ${formatDuration(duree*60*1000)}`, ephemeral:true });
    }
    if(sub==="lister"){
      const list=getAllEvents(guildId).filter(e=>e.type==="reminder" && e.createdBy===interaction.user.id);
      if(!list.length) return interaction.reply({content:"Aucun rappel en cours.", ephemeral:true});
      const lines=list.map(e=>`• **${e.title}** \`${e.id}\` — fin <t:${Math.floor(e.endsAt/1000)}:R> — ${e.description ?? ""}`).join("\n");
      return interaction.reply({content:lines, ephemeral:true});
    }
    if(sub==="annuler"){
      const id=interaction.options.getString("id",true);
      const ok=cancelEvent(id);
      return interaction.reply({content: ok ? `Rappel \`${id}\` annulé.` : `Rappel \`${id}\` introuvable.`, ephemeral:true});
    }
  }
} satisfies Command;
