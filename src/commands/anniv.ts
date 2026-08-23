import * as pkg from "discord.js";
const { SlashCommandBuilder, EmbedBuilder } = pkg as any;
import type { Command } from "../types.js";
import { loadGuilds, saveGuilds, loadBirthdays, saveBirthdays, setBirthday, deleteBirthday, getBirthday, type GuildConfig } from "../database/json-db.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("anniv")
    .setDescription("🎂 Gérer les anniversaires")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Définir ton anniversaire")
        .addNumberOption((opt) => opt.setName("month").setDescription("Mois (1-12)").setRequired(true))
        .addNumberOption((opt) => opt.setName("day").setDescription("Jour (1-31)").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("serveur")
        .setDescription("Configurer les annonces anniversaire du serveur")
        .addStringOption((opt) =>
          opt.setName("message").setDescription("Message d'annonce custom (utilise {pseudo}, {age}, {date})").setRequired(false),
        )
        .addRoleOption((opt) => opt.setName("role").setDescription("Rôle à attribuer").setRequired(false))
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("Salon d'annonce").setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("Lister les anniversaires du serveur"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Supprimer ton anniversaire")
        .addUserOption((opt) => opt.setName("membre").setDescription("Membre").setRequired(false)),
    ),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const sub = interaction.options.getSubcommand(true);
    const cfg = loadGuilds().get(guildId) || {};
    const bday = getBirthday(guildId, userId);

    if (sub === "set") {
      const month = interaction.options.getNumber("month")!;
      const day = interaction.options.getNumber("day")!;
      setBirthday(guildId, userId, month, day);
      await interaction.reply({ content: `✅ Ton anniversaire est enregistré le ${month}/${day} !`, ephemeral: true });
      return;
    }

    if (sub === "serveur") {
      if (!interaction.memberPermissions?.has("ManageGuild")) {
        await interaction.reply({ content: "❌ Tu as besoin de la permission **Gérer le serveur**.", ephemeral: true });
        return;
      }
      const s = loadGuilds().get(guildId) || {} as GuildConfig;
      if (interaction.options.getString("message")) {
        s.birthdayMessage = interaction.options.getString("message")!;
      }
      if (interaction.options.getRole("role")) {
        s.birthdayRoleId = interaction.options.getRole("role")!.id;
      }
      if (interaction.options.getChannel("channel")) {
        s.birthdayChannelId = interaction.options.getChannel("channel")!.id;
      }
      saveGuilds(new Map([[guildId, s]]));
      await interaction.reply({ content: "✅ Configuration serveur mise à jour.", ephemeral: true });
      return;
    }

    if (sub === "list") {
      const bdays = loadBirthdays();
      const serverBdays = Object.entries(bdays)
        .filter(([k]) => k.startsWith(guildId + ":"))
        .map(([k, v]) => {
          const user = interaction.guild.members.cache.get(k.split(":")[1]);
          return `- ${user?.user.username ?? k.split(":")[1]} : ${v.month}/${v.day}`;
        });
      await interaction.reply({ content: serverBdays.length > 0 ? `Anniversaires du serveur :\n${serverBdays.join("\n")}` : "Aucun anniversaire enregistré.", ephemeral: true });
      return;
    }

    if (sub === "remove") {
      const targetUser = interaction.options.getUser("membre") || interaction.user;
      deleteBirthday(guildId, targetUser.id);
      await interaction.reply({ content: `✅ L'anniversaire de ${targetUser.username} a été supprimé.`, ephemeral: true });
      return;
    }

    await interaction.reply({ content: "Utilise `/anniv set <mois> <jour>` pour définir ton anniversaire, ou `/anniv serveur` pour configurer les annonces.", ephemeral: true });
  },
} satisfies Command;