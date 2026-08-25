import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getConsumables, getShopItem } from "../data/items.js";
import { consumeItem } from "../database/inventory.js";
import {
  addBalance,
  addXp,
  getPlayer,
  maxHp,
  setHp,
} from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber, progressBar } from "../utils/format.js";
import { randomInt } from "../utils/random.js";
import { config } from "../config.js";

const LOTTERY_JACKPOT = 1000;
const LOTTERY_CHANCE = 0.1;
const POTION_HEAL = 40;

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("utiliser")
    .setDescription("Utilise un objet de ton inventaire")
    .addStringOption((option) =>
      option
        .setName("objet")
        .setDescription("L'objet à utiliser")
        .setRequired(true)
        .addChoices(
          ...getConsumables().map((item) => ({
            name: `${item.emoji} ${item.name}`,
            value: item.id,
          })),
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const itemId = interaction.options.getString("objet", true);
    const item = getShopItem(itemId);

    if (!item || item.kind !== "consumable") {
      await interaction.reply({
        embeds: [errorEmbed("Cet objet n'existe pas.")],
      });
      return;
    }

    if (!consumeItem(interaction.guildId, interaction.user.id, item.id)) {
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
          .setTitle("Boîte mystère")
          .setDescription(
            `Tu ouvres la boîte avec précaution…\n\n Contenu : **+${formatNumber(coins)} ${config.currency}** !`,
          );
        break;
      }

      case "ticket-loterie": {
        if (Math.random() < LOTTERY_CHANCE) {
          addBalance(interaction.guildId, interaction.user.id, LOTTERY_JACKPOT);
          embed = createEmbed("success")
            .setTitle("Tirage de la loterie")
            .setDescription(
              [
                "Les numéros tombent… **C'EST GAGNÉ !**",
                "",
                `Jackpot : **+${formatNumber(LOTTERY_JACKPOT)} ${config.currency}**`,
              ].join("\n"),
            );
        } else {
          embed = createEmbed()
            .setTitle("Tirage de la loterie")
            .setDescription(
              "Les numéros tombent… Pas cette fois. Tente ta chance à nouveau !",
            );
        }
        break;
      }

      case "potion": {
        const player = getPlayer(interaction.guildId, interaction.user.id);
        const hpMax = maxHp(player.level);

        if (player.hp >= hpMax) {
          embed = createEmbed("warning").setDescription(
            `Tu es déjà en pleine forme (**${player.hp}/${hpMax} PV**). La potion est perdue…`,
          );
          break;
        }

        const healed = Math.min(hpMax, player.hp + POTION_HEAL);
        setHp(interaction.guildId, interaction.user.id, healed);

        embed = createEmbed("success")
          .setTitle("Potion de soin")
          .setDescription(
            `Glou glou… Tu récupères **+${healed - player.hp} PV** !\n\n${progressBar(healed, hpMax)} **${healed} / ${hpMax}** PV`,
          );
        break;
      }

      case "cafe": {
        const result = addXp(interaction.guildId, interaction.user.id, 50);
        embed = createEmbed("success")
          .setTitle("Pause café")
          .setDescription(
            result.leveledUp
              ? `Mmmh, ça réveille ! **+50 XP** — et tu passes au niveau **${result.level}** !`
              : "Mmmh, ça réveille ! **+50 XP**",
          );
        break;
      }

      default:
        embed = createEmbed().setDescription("Rien ne se passe…");
    }

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
