import * as pkg from "discord.js";
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = pkg as any;
import type { Command } from "../types.js";
import { createEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("demo")
    .setDescription("Interactions boutons et selecteur — demo")
    .addSubcommand(s=>s.setName("boutons").setDescription("Demo boutons"))
    .addSubcommand(s=>s.setName("select").setDescription("Demo select menu")),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "boutons") {
      const row:any = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("demo:ok").setLabel("Valider").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("demo:cancel").setLabel("Annuler").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("demo:info").setLabel("Info").setStyle(ButtonStyle.Primary),
      );
      await interaction.reply({ embeds:[createEmbed().setTitle("Boutons").setDescription("Clique un bouton ci-dessous.")], components:[row] });
      return;
    }
    if (sub === "select") {
      const row:any = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId("demo:select").setPlaceholder("Choisis une option").addOptions(
          { label:"Rôles", value:"roles", description:"Gestion des roles" },
          { label:"Tickets", value:"tickets", description:"Support tickets" },
          { label:"Boutique", value:"shop", description:"Articles et economie" },
        )
      );
      await interaction.reply({ embeds:[createEmbed().setTitle("Selecteur").setDescription("Choisis dans le menu.")], components:[row] });
      return;
    }
  },
} satisfies Command;
