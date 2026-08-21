import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { SHOP_ITEMS, getShopItem } from "../data/items.js";
import { consumeItem } from "../database/inventory.js";
import { addBalance, addXp } from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { randomInt } from "../utils/random.js";
import { config } from "../config.js";

const LOTTERY_JACKPOT = 1000;
const LOTTERY_CHANCE = 0.1;

export default {
  data: new SlashCommandBuilder()
    .setName("utiliser")
    .setDescription("✨ Utilise un objet de ton inventaire")
    .addStringOption((option) =>
      option
        .setName("objet")
        .setDescription("L'objet à utiliser")
        .setRequired(true)
        .addChoices(
          ...SHOP_ITEMS.map((item) => ({
            name: `${item.emoji} ${item.name}`,
            value: item.id,
          })),
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const itemId = interaction.options.getString("objet", true);
    const item = getShopItem(itemId);

    if (!item) {
      await interaction.reply({
        embeds: [errorEmbed("Cet objet n'existe pas.")],
      });
      return;
    }

    if (!consumeItem(interaction.guildId, interaction.user.id, item)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            `Tu n'as pas ${item.emoji} **${item.name}** ! Passe à la boutique avec \`/acheter\`.`,
          ),
        ],
      });
      return;
    }

    let embed;

    switch (item.id) {
      case "boite-mystere": {
        const coins = randomInt(50, 500);
        addBalance(interaction.guildId, interaction.user.id, coins);
        embed = createEmbed("success")
          .setTitle("🎁 Boîte mystère")
          .setDescription(
            `Tu ouvres la boîte avec précaution…\n\n🎉 Contenu : **+${formatNumber(coins)} ${config.currency}** !`,
          );
        break;
      }

      case "ticket-loterie": {
        if (Math.random() < LOTTERY_CHANCE) {
          addBalance(interaction.guildId, interaction.user.id, LOTTERY_JACKPOT);
          embed = createEmbed("success")
            .setTitle("🎟️ Tirage de la loterie")
            .setDescription(
              [
                "Les numéros tombent… **C'EST GAGNÉ !** 🎊",
                "",
                `💰 Jackpot : **+${formatNumber(LOTTERY_JACKPOT)} ${config.currency}**`,
              ].join("\n"),
            );
        } else {
          embed = createEmbed()
            .setTitle("🎟️ Tirage de la loterie")
            .setDescription(
              "Les numéros tombent… Pas cette fois. 😢 Tente ta chance à nouveau !",
            );
        }
        break;
      }

      case "cafe": {
        const result = addXp(
          interaction.guildId,
          interaction.user.id,
          50,
        );
        embed = createEmbed("success")
          .setTitle("☕ Pause café")
          .setDescription(
            result.leveledUp
              ? `Mmmh, ça réveille ! **+50 XP** — et tu passes au niveau **${result.level}** ! 🎉`
              : "Mmmh, ça réveille ! **+50 XP** ⚡",
          );
        break;
      }

      default:
        embed = createEmbed().setDescription("Rien ne se passe…");
    }

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
