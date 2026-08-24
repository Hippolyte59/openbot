import * as pkg from "discord.js";
const { SlashCommandBuilder } = pkg as any;
import type { Command } from "../types.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("dire")
    .setDescription("Profils de messages — pseudo et avatar personnalise via webhook")
    .addStringOption(o=>o.setName("message").setDescription("Contenu a envoyer").setRequired(true))
    .addStringOption(o=>o.setName("pseudo").setDescription("Pseudo affiche").setRequired(false))
    .addStringOption(o=>o.setName("avatar").setDescription("URL avatar").setRequired(false)),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.channel || !("createWebhook" in interaction.channel as any)) { await interaction.reply({content:"Salon non compatible webhooks.", ephemeral:true}); return; }
    const content = interaction.options.getString("message", true);
    const pseudo = interaction.options.getString("pseudo") ?? interaction.user.displayName;
    const avatar = interaction.options.getString("avatar") ?? interaction.user.displayAvatarURL();
    await interaction.deferReply({ephemeral:true});
    try {
      const channel:any = interaction.channel;
      const hooks = await channel.fetchWebhooks().catch(()=>null);
      let hook = hooks?.find((w:any)=>w.owner?.id === interaction.client.user.id);
      if (!hook) hook = await channel.createWebhook({ name: "OpenBot Profils", avatar: interaction.client.user.displayAvatarURL() }).catch(()=>null);
      if (!hook) { await interaction.editReply("Impossible de creer le webhook (permission Manages webhooks requise)."); return; }
      await hook.send({ content, username: pseudo.slice(0,80), avatarURL: avatar });
      await interaction.editReply("Message envoye avec profil personnalise.");
    } catch (e:any) {
      await interaction.editReply(`Erreur: ${e.message ?? e}`);
    }
  },
} satisfies Command;
