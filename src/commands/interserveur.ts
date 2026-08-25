import * as pkg from "discord.js";
const { SlashCommandBuilder, PermissionFlagsBits } = pkg as any;
import type { Command } from "../types.js";
import { createInterserver, joinInterserver, leaveInterserver, deleteInterserver, getAllInterservers, getInterserversByGuild } from "../database/interserver.js";

export default {
  data: new SlashCommandBuilder()
    .setName("interserveur")
    .setDescription("Gère les interserveurs (plusieurs ponts entre serveurs)")
    .addSubcommand(s => s.setName("creer").setDescription("Crée un nouvel interserveur")
      .addStringOption(o=>o.setName("nom").setDescription("Nom de l'interserveur").setRequired(true))
      .addChannelOption(o=>o.setName("salon").setDescription("Salon à lier (actuel par défaut)")))
    .addSubcommand(s => s.setName("rejoindre").setDescription("Rejoint un interserveur existant")
      .addStringOption(o=>o.setName("nom").setDescription("Nom de l'interserveur").setRequired(true))
      .addChannelOption(o=>o.setName("salon").setDescription("Salon à lier")))
    .addSubcommand(s => s.setName("quitter").setDescription("Quitte un interserveur")
      .addStringOption(o=>o.setName("nom").setDescription("Nom de l'interserveur").setRequired(true)))
    .addSubcommand(s => s.setName("liste").setDescription("Liste les interserveurs"))
    .addSubcommand(s => s.setName("supprimer").setDescription("Supprime un interserveur (créateur uniquement)")
      .addStringOption(o=>o.setName("nom").setDescription("Nom de l'interserveur").setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: any) {
    if (!interaction.inGuild()) return;
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const guildName = interaction.guild!.name;

    if (sub === "creer") {
      const nom = interaction.options.getString("nom", true);
      const salon = interaction.options.getChannel("salon") ?? interaction.channel;
      try {
        const interserver = createInterserver(nom, guildId, salon.id, interaction.user.id);
        return interaction.reply({ content: `Interserveur **${nom}** créé avec ${salon} — d'autres serveurs peuvent le rejoindre avec \`/interserveur rejoindre ${nom}\``, ephemeral: true });
      } catch (e: any) {
        return interaction.reply({ content: `${e.message}`, ephemeral: true });
      }
    }

    if (sub === "rejoindre") {
      const nom = interaction.options.getString("nom", true);
      const salon = interaction.options.getChannel("salon") ?? interaction.channel;
      try {
        const interserver = joinInterserver(nom, guildId, salon.id);
        if (!interserver) return interaction.reply({ content: `Interserveur **${nom}** introuvable.`, ephemeral: true });
        return interaction.reply({ content: `${salon} a rejoint l'interserveur **${nom}** (${interserver.guilds.length} salons connectés)`, ephemeral: true });
      } catch (e: any) {
        return interaction.reply({ content: `${e.message}`, ephemeral: true });
      }
    }

    if (sub === "quitter") {
      const nom = interaction.options.getString("nom", true);
      const ok = leaveInterserver(nom, guildId);
      return interaction.reply({ content: ok ? `Serveur **${guildName}** a quitté l'interserveur **${nom}**` : `Interserveur **${nom}** introuvable ou non rejoint.`, ephemeral: true });
    }

    if (sub === "liste") {
      const all = getAllInterservers();
      const mine = getInterserversByGuild(guildId);
      if (!all.length) return interaction.reply({ content: "Aucun interserveur n'existe encore. Crée-en un avec `/interserveur creer <nom>`", ephemeral: true });
      const lines = all.map(i => `• **${i.name}** — ${i.guilds.length} salon(s) ${mine.some(m=>m.name===i.name) ? "(ton serveur est dedans)" : ""} — créé <t:${Math.floor(i.createdAt/1000)}:R>`).join("\n");
      return interaction.reply({ content: lines, ephemeral: true });
    }

    if (sub === "supprimer") {
      const nom = interaction.options.getString("nom", true);
      const ok = deleteInterserver(nom);
      return interaction.reply({ content: ok ? `Interserveur **${nom}** supprimé.` : `Interserveur **${nom}** introuvable.`, ephemeral: true });
    }
  }
} satisfies Command;
