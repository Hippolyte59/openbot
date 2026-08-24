import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = pkg as any;
import type { Command } from "../types.js";
import { loadTickets, saveTickets } from "../database/json-db.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("ticket")
    .setDescription("Tickets support")
    .addSubcommand(s=>s.setName("creer").setDescription("Creer un ticket").addStringOption(o=>o.setName("sujet").setDescription("Sujet").setRequired(true)))
    .addSubcommand(s=>s.setName("fermer").setDescription("Fermer le ticket actuel"))
    .addSubcommand(s=>s.setName("panel").setDescription("Poster le panel ticket avec bouton")),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const sub = interaction.options.getSubcommand();
    const guild:any = interaction.guild;
    if (sub === "creer") {
      const sujet = interaction.options.getString("sujet", true);
      const name = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,12)}-${Date.now().toString(36).slice(-4)}`;
      await interaction.deferReply({ephemeral:true});
      const channel = await guild.channels.create({ name, type: ChannelType.GuildText, permissionOverwrites:[
        { id: guild.id, deny:[PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow:[PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ]}).catch(()=>null);
      if (!channel) { await interaction.editReply("Permission insuffisante pour creer le salon."); return; }
      const store = loadTickets();
      const id = `${guild.id}:${channel.id}`;
      store.set(id, { id, guildId: guild.id, channelId: channel.id, ownerId: interaction.user.id, reason:sujet, status:"open", createdAt: Date.now() });
      saveTickets(store);
      await channel.send({ embeds:[createEmbed().setTitle("Ticket").setDescription(`Ouvert par <@${interaction.user.id}>\nSujet: ${sujet}`)] });
      await interaction.editReply(`Ticket cree: <#${channel.id}>`);
      return;
    }
    if (sub === "fermer") {
      const channel:any = interaction.channel;
      const store = loadTickets();
      const t = [...store.values()].find(x=>x.channelId===channel.id && x.guildId===guild.id);
      if (!t) { await interaction.reply({content:"Ce salon n'est pas un ticket.", ephemeral:true}); return; }
      store.delete(`${guild.id}:${channel.id}`); saveTickets(store);
      await interaction.reply("Fermeture dans 3s..."); setTimeout(()=>channel.delete().catch(()=>{}), 3000);
      return;
    }
    if (sub === "panel") {
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = pkg as any;
      const row:any = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket:create").setLabel("Ouvrir un ticket").setStyle(ButtonStyle.Primary));
      await interaction.reply({ embeds:[createEmbed().setTitle("Support").setDescription("Clique pour ouvrir un ticket.")], components:[row] });
      return;
    }
  },
} satisfies Command;
