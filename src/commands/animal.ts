import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import {
  getPlayer,
  updatePlayer,
} from "../database/players.js";
import { ANIMALS, getAnimal } from "../data/animals.js";
import { createEmbed, errorEmbed, successEmbed } from "../utils/embeds.js";

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("animal")
    .setDescription("🐾 Gère ton animal de compagnie")
    .addSubcommand((sub) =>
      sub
        .setName("voir")
        .setDescription("👀 Affiche ton animal de compagnie"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("acheter")
        .setDescription("🛒 Achète un animal de compagnie")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("L'animal à acheter")
            .setRequired(true)
            .addChoices(
              ...ANIMALS.map((animal) => ({
                name: `${animal.name} (+${animal.bonus}% pièces)`,
                value: animal.id,
              })),
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("nommer")
        .setDescription("✏️ Renomme ton animal de compagnie")
        .addStringOption((option) =>
          option
            .setName("nom")
            .setDescription("Le nouveau nom (2-20 caractères)")
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(20),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("relacher")
        .setDescription(
          "🕊️ Relâche ton animal (remboursement de 50 % de son prix)",
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const player = getPlayer(guildId, userId);
    const sub = interaction.options.getSubcommand(true);

    if (sub === "voir") {
      if (!player.animal) {
        await interaction.reply({
          embeds: [errorEmbed("Tu n'as pas d'animal. Adopte-en un avec `/animal acheter` !")],
          ephemeral: true,
        });
        return;
      }

      const animal = getAnimal(player.animal)!;
      await interaction.reply({
        embeds: [
          createEmbed()
            .setTitle(`${animal.emoji} ${player.animal_name ?? animal.name}`)
            .setDescription(
              [
                `**Espèce :** ${animal.name}`,
                `**Bonus :** +${animal.bonus}% sur les gains de pièces`,
                `**Valeur :** ${Math.floor(animal.price / 2)} pièces (revente)`,
              ].join("\n"),
            ),
        ],
      });
      return;
    }

    if (sub === "acheter") {
      const animalId = interaction.options.getString("type", true);
      const animal = getAnimal(animalId)!;

      if (player.animal) {
        const current = getAnimal(player.animal)!;
        await interaction.reply({
          embeds: [
            errorEmbed(
              `Tu as déjà ${current.emoji} **${player.animal_name ?? current.name}**. Relâche-le d'abord avec \`/animal relacher\`.`,
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      if (player.balance < animal.price) {
        await interaction.reply({
          embeds: [
            errorEmbed(
              `Il te manque **${animal.price - player.balance} 🪙** pour adopter ${animal.emoji} ${animal.name}.`,
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      updatePlayer(guildId, userId, {
        balance: player.balance - animal.price,
        animal: animal.id,
        animal_name: null,
      });

      await interaction.reply({
        embeds: [
          successEmbed(
            `Bienvenue à ton nouveau compagnon ${animal.emoji} **${animal.name}** ! Il te rapportera désormais **+${animal.bonus}%** de pièces.`,
          ).addFields({
            name: "Coût",
            value: `${animal.price} 🪙`,
            inline: true,
          }),
        ],
      });
      return;
    }

    if (sub === "nommer") {
      if (!player.animal) {
        await interaction.reply({
          embeds: [errorEmbed("Tu n'as pas d'animal à renommer.")],
          ephemeral: true,
        });
        return;
      }

      const name = interaction.options.getString("nom", true);
      updatePlayer(guildId, userId, { animal_name: name });
      await interaction.reply({
        embeds: [successEmbed(`Ton animal s'appelle désormais **${name}**.`)],
      });
      return;
    }

    if (!player.animal) {
      await interaction.reply({
        embeds: [errorEmbed("Tu n'as pas d'animal à relâcher.")],
        ephemeral: true,
      });
      return;
    }

    const animal = getAnimal(player.animal)!;
    const refund = Math.floor(animal.price / 2);
    updatePlayer(guildId, userId, {
      balance: player.balance + refund,
      animal: null,
      animal_name: null,
    });

    await interaction.reply({
      embeds: [
        createEmbed("warning").setDescription(
          `${animal.emoji} **${player.animal_name ?? animal.name}** est retourné à la vie sauvage.\n> Remboursement : **${refund} 🪙**`,
        ),
      ],
    });
  },
} satisfies Command;
