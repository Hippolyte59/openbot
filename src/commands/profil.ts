import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.js";
import { getPlayer, maxHp, xpNeededFor } from "../database/players.js";
import { getShopItem } from "../data/items.js";
import { createEmbed } from "../utils/embeds.js";
import { formatNumber, progressBar } from "../utils/format.js";
import { config } from "../config.js";

function equipmentLabel(itemId: string | null): string {
  if (!itemId) return "_Aucun_";
  const item = getShopItem(itemId);
  return item ? `${item.emoji} ${item.name}` : "_Aucun_";
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
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
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
