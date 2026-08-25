import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { startAdventure } from "../systems/adventure.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("aventure")
    .setDescription("Pars à l'aventure et affronte un monstre"),

  async execute(interaction) {
    await startAdventure(interaction);
  },
} satisfies Command;
