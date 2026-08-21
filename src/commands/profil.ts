import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getPlayer, maxHp, xpNeededFor } from "../database/players.js";
import { getShopItem } from "../data/items.js";
import { getAnimal } from "../data/animals.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber, progressBar } from "../utils/format.js";
import { config } from "../config.js";

function equipmentLabel(itemId: string | null): string {
  if (!itemId) return "_Aucun_";
  const item = getShopItem(itemId);
  return item ? `${item.emoji} ${item.name}` : "_Aucun_";
}

/** Badges calculés dynamiquement à partir du profil (comme DraftBot). */
function badgesFor(player: {
  level: number;
  balance: number;
  wins: number;
  partner: string | null;
  animal: string | null;
}): string[] {
  const badges: string[] = [];
  if (player.level >= 5) badges.push("🌱 Débutant");
  if (player.level >= 20) badges.push("⭐ Vétéran");
  if (player.balance >= 5_000) badges.push("💰 Riche");
  if (player.wins >= 1) badges.push("⚔️ Combattant");
  if (player.wins >= 25) badges.push("🏆 Héros");
  if (player.partner) badges.push("💍 Marié");
  if (player.animal) badges.push("🐾 Dresseur");
  return badges;
}

export default {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("👤 Affiche le profil d'un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont voir le profil (toi par défaut)")
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const target = interaction.options.getUser("membre") ?? interaction.user;
    const player = getPlayer(interaction.guildId, target.id);

    const needed = xpNeededFor(player.level);
    const hpMax = maxHp(player.level);

    const embed = createEmbed()
      .setAuthor({
        name: `Profil de ${target.username}`,
        iconURL: target.displayAvatarURL(),
      })
      .setThumbnail(target.displayAvatarURL({ size: 256 }));

    const badges = badgesFor(player);
    embed.setDescription(
      badges.length > 0
        ? badges.join(" • ")
        : "_Aucun badge pour l'instant — continue de jouer !_",
    );

    const animalLabel = player.animal
      ? `${getAnimal(player.animal)?.emoji ?? "🐾"} ${player.animal_name ?? getAnimal(player.animal)?.name}`
      : "_Aucun_";

    embed.addFields(
      {
        name: "💰 Argent",
        value: `${formatNumber(player.balance)} ${config.currency}`,
        inline: true,
      },
      {
        name: "⭐ Niveau",
        value: `${player.level}`,
        inline: true,
      },
      {
        name: "🔥 Série quotidienne",
        value: `${player.daily_streak} jour(s)`,
        inline: true,
      },
      {
        name: "❤️ Points de vie",
        value: `${progressBar(player.hp, hpMax)}\n**${player.hp} / ${hpMax}** PV`,
      },
      {
        name: "⚔️ Arme",
        value: equipmentLabel(player.weapon),
        inline: true,
      },
      {
        name: "🛡️ Armure",
        value: equipmentLabel(player.armor),
        inline: true,
      },
      {
        name: "🏆 Victoires d'aventure",
        value: `${player.wins}`,
        inline: true,
      },
      {
        name: "💍 Conjoint",
        value: player.partner ? `<@${player.partner}>` : "_Célibataire_",
        inline: true,
      },
      {
        name: "🐾 Animal",
        value: animalLabel,
        inline: true,
      },
    );

    if (target.bot && target.id !== interaction.client.user.id) {
      embed.setDescription("🤖 C'est un bot… il n'a pas besoin de pièces !");
      await interaction.reply({ embeds: [embed] });
      return;
    }

    embed.addFields({
      name: "📈 XP",
      value: `${progressBar(player.xp, needed)}\n**${formatNumber(player.xp)} / ${formatNumber(needed)}** XP`,
    });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
