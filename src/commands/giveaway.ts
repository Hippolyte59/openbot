import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { createEvent, getAllEvents, cancelEvent, formatDuration } from "../systems/scheduler.js";

export default {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Gère les giveaways (plusieurs simultanés)")
    .addSubcommand(s => s.setName("creer").setDescription("Créer un giveaway")
      .addStringOption(o=>o.setName("titre").setDescription("Titre du lot").setRequired(true))
      .addIntegerOption(o=>o.setName("duree").setDescription("Durée en minutes").setRequired(true).setMinValue(1).setMaxValue(10080))
      .addStringOption(o=>o.setName("description").setDescription("Description du lot"))
      .addChannelOption(o=>o.setName("salon").setDescription("Salon où annoncer (actuel par défaut)")))
    .addSubcommand(s=>s.setName("lister").setDescription("Lister les giveaways en cours"))
    .addSubcommand(s=>s.setName("annuler").setDescription("Annuler un giveaway")
      .addStringOption(o=>o.setName("id").setDescription("ID du giveaway").setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction: any){
    if(!interaction.inGuild()) return;
    const sub=interaction.options.getSubcommand();
    const guildId=interaction.guildId!;

    if(sub==="creer"){
      const titre=interaction.options.getString("titre",true);
      const duree=interaction.options.getInteger("duree",true);
      const description=interaction.options.getString("description") ?? "";
      const salon=interaction.options.getChannel("salon") ?? interaction.channel;
      const endsAt=Date.now()+duree*60*1000;
      const ev=createEvent({ guildId, channelId: salon.id, type:"giveaway", title:titre, description, createdBy: interaction.user.id, endsAt });
      await interaction.reply({ content: `🎉 Giveaway **${titre}** créé ! ID: \`${ev.id}\` • Fin dans ${formatDuration(duree*60*1000)} dans ${salon} • Participants : faites \`/giveaway participer\` ou cliquez 🎉`, ephemeral:false });
      await salon.send(`🎉 **GIVEAWAY** : **${titre}** — ${description}\nFin <t:${Math.floor(endsAt/1000)}:R> • ID \`${ev.id}\` • Réagissez 🎉 pour participer !`);
      return;
    }
    if(sub==="lister"){
      const list=getAllEvents(guildId).filter(e=>e.type==="giveaway");
      if(!list.length) return interaction.reply({content:"Aucun giveaway en cours.", ephemeral:true});
      const lines=list.map(e=>`• **${e.title}** \` ${e.id}\` — fin <t:${Math.floor(e.endsAt/1000)}:R> — ${e.participants?.length ?? 0} participants`).join("\n");
      return interaction.reply({content:lines, ephemeral:true});
    }
    if(sub==="annuler"){
      const id=interaction.options.getString("id",true);
      const ok=cancelEvent(id);
      return interaction.reply({content: ok ? `Giveaway \`${id}\` annulé.` : `Giveaway \`${id}\` introuvable.`, ephemeral:true});
    }
  }
} satisfies Command;
