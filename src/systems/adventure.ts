import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type EmbedBuilder,
} from "discord.js";
import {
  addItem,
  consumeItem,
  getItemCount,
} from "../database/inventory.js";
import {
  addBalance,
  addXp,
  getPlayer,
  maxHp,
  setHp,
  updatePlayer,
} from "../database/players.js";
import { getShopItem } from "../data/items.js";
import { pickMonster } from "../data/monsters.js";
import { createEmbed } from "../utils/embeds.js";
import { progressBar } from "../utils/format.js";
import { randomInt } from "../utils/random.js";
import { config } from "../config.js";

/** Cooldown entre deux aventures. */
export const ADVENTURE_COOLDOWN = 5 * 60 * 1000;

const POTION_HEAL = 40;
const DROP_CHANCE = 0.15;

interface ActiveFight {
  guildId: string;
  userId: string;
  name: string;
  emoji: string;
  monsterHp: number;
  monsterMaxHp: number;
  atkMin: number;
  atkMax: number;
  reward: [number, number];
  xpReward: [number, number];
  playerHp: number;
  playerMaxHp: number;
  log: string[];
  messageId: string;
  ended: boolean;
}

/** Combats en cours, indexés par utilisateur. */
const activeFights = new Map<string, ActiveFight>();

function weaponPower(userId: string, guildId: string): number {
  const player = getPlayer(guildId, userId);
  return player.weapon ? getShopItem(player.weapon)?.power ?? 0 : 0;
}

function armorPower(userId: string, guildId: string): number {
  const player = getPlayer(guildId, userId);
  return player.armor ? getShopItem(player.armor)?.power ?? 0 : 0;
}

function equipmentLabel(itemId: string | null): string {
  if (!itemId) return "Aucune";
  const item = getShopItem(itemId);
  return item ? `${item.emoji} ${item.name}` : "Aucune";
}

function buildButtons(fight: ActiveFight, disabled = false): ActionRowBuilder<ButtonBuilder> {
  const potions = getItemCount(fight.guildId, fight.userId, "potion");
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`adv:${fight.userId}:attack`)
      .setLabel("Attaquer")
      .setEmoji("⚔️")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`adv:${fight.userId}:potion`)
      .setLabel(`Potion (${potions})`)
      .setEmoji("🧪")
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled || potions === 0),
    new ButtonBuilder()
      .setCustomId(`adv:${fight.userId}:flee`)
      .setLabel("Fuir")
      .setEmoji("🏃")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
  );
}

function hpLine(label: string, hp: number, max: number): string {
  return `${label}\n${progressBar(hp, max)} **${Math.max(0, hp)} / ${max}** PV`;
}

function buildEmbed(fight: ActiveFight): EmbedBuilder {
  return createEmbed("primary")
    .setTitle(`${fight.emoji} ${fight.name}`)
    .setDescription(
      [
        hpLine(`**${fight.name}**`, fight.monsterHp, fight.monsterMaxHp),
        "",
        hpLine("**Toi**", fight.playerHp, fight.playerMaxHp),
        "",
        ...fight.log.slice(-5),
      ].join("\n"),
    );
}

function pushLog(fight: ActiveFight, line: string): void {
  fight.log.push(line);
}

async function finishFight(
  fight: ActiveFight,
  button: ButtonInteraction,
  outcome: "victory" | "defeat" | "flee",
): Promise<void> {
  fight.ended = true;

  let outro: string;
  if (outcome === "victory") {
    const coins = randomInt(fight.reward[0], fight.reward[1]);
    const xpGain = randomInt(fight.xpReward[0], fight.xpReward[1]);
    addBalance(fight.guildId, fight.userId, coins);
    const xpResult = addXp(fight.guildId, fight.userId, xpGain);

    outro = `\n🏆 **Victoire !** Tu remportes **+${coins} ${config.currency}** et **+${xpGain} XP** !`;

    if (Math.random() < DROP_CHANCE) {
      addItem(fight.guildId, fight.userId, "potion");
      outro += `\n🎁 Le monstre a lâché une 🧪 **Potion de soin** !`;
    }

    if (xpResult.leveledUp) {
      outro += `\n🎉 Niveau **${xpResult.level}** atteint ! Tes PV maximum augmentent.`;
      fight.playerMaxHp = maxHp(xpResult.level);
    }
  } else if (outcome === "defeat") {
    const player = getPlayer(fight.guildId, fight.userId);
    const lost = Math.min(
      player.balance,
      Math.max(10, Math.floor(player.balance * 0.1)),
    );
    addBalance(fight.guildId, fight.userId, -lost);
    setHp(fight.guildId, fight.userId, 0);

    outro = `\n💀 **K.O.** Le ${fight.name} t'a mis au sol… Tu perds **${lost} ${config.currency}** en fuyant en boitant.`;
    fight.playerHp = 0;
  } else {
    outro = `\n🏃 Tu prends la fuite et te mets à l'abri. Aucune récompense cette fois.`;
  }

  // Dernière mise à jour des PV du joueur dans la base
  updatePlayer(fight.guildId, fight.userId, {
    last_adventure: Date.now(),
  });

  const embed = buildEmbed(fight);
  embed.setDescription(embed.data.description + outro);

  await button.update({
    embeds: [embed],
    components: [buildButtons(fight, true)],
  });
}

function playerAttack(fight: ActiveFight): void {
  const player = getPlayer(fight.guildId, fight.userId);
  let damage =
    randomInt(6, 12) +
    Math.floor(player.level / 2) +
    weaponPower(fight.userId, fight.guildId);

  const critical = Math.random() < 0.15;
  if (critical) damage = Math.floor(damage * 2);

  fight.monsterHp -= damage;
  pushLog(
    fight,
    critical
      ? `⚡ **Coup critique !** Tu infliges **${damage}** dégâts.`
      : `⚔️ Tu infliges **${damage}** dégâts.`,
  );
}

function monsterAttack(fight: ActiveFight): void {
  const raw = randomInt(fight.atkMin, fight.atkMax);
  const damage = Math.max(1, raw - armorPower(fight.userId, fight.guildId));
  fight.playerHp -= damage;
  pushLog(fight, `${fight.emoji} Le ${fight.name} riposte : **-${damage} PV**.`);
}

export async function startAdventure(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inGuild()) return;

  const guildId = interaction.guildId;
  const userId = interaction.user.id;

  if (activeFights.has(userId)) {
    await interaction.reply({
      embeds: [createEmbed("error").setDescription("❌ Termine d'abord ton combat en cours !")],
      ephemeral: true,
    });
    return;
  }

  const player = getPlayer(guildId, userId);
  const now = Date.now();
  const elapsed = now - player.last_adventure;

  if (elapsed < ADVENTURE_COOLDOWN && player.last_adventure > 0) {
    const minutesLeft = Math.ceil((ADVENTURE_COOLDOWN - elapsed) / 60000);
    await interaction.reply({
      embeds: [
        createEmbed("error").setDescription(
          `❌ Ton équipement doit être réparé : reviens dans **${minutesLeft} min**.`,
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  const hpMax = maxHp(player.level);
  if (player.hp < Math.ceil(hpMax * 0.3)) {
    await interaction.reply({
      embeds: [
        createEmbed("error").setDescription(
          [
            `❌ Tu es trop faible pour partir à l'aventure (**${player.hp}/${hpMax} PV**).`,
            "",
            "💡 Repose-toi (régénération automatique) ou bois une 🧪 potion de la boutique.",
          ].join("\n"),
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  // ── Création du combat ──────────────────────────────────────────────────
  const monster = pickMonster(player.level);
  const bonus = Math.floor(player.level / 3);

  const fight: ActiveFight = {
    guildId,
    userId,
    name: monster.name,
    emoji: monster.emoji,
    monsterHp: monster.baseHp + player.level * 4,
    monsterMaxHp: monster.baseHp + player.level * 4,
    atkMin: monster.attack[0] + bonus,
    atkMax: monster.attack[1] + bonus,
    reward: monster.reward,
    xpReward: monster.xpReward,
    playerHp: player.hp,
    playerMaxHp: hpMax,
    log: [
      `🌲 Tu explores les environs et tombes sur un **${monster.name}** !`,
      `🗡️ Arme : ${equipmentLabel(player.weapon)} • Armure : ${equipmentLabel(player.armor)}`,
    ],
    messageId: "",
    ended: false,
  };

  activeFights.set(userId, fight);

  const message = await interaction.editReply({
    embeds: [buildEmbed(fight)],
    components: [buildButtons(fight)],
  });
  fight.messageId = message.id;

  // ── Collecteur de boutons ───────────────────────────────────────────────
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120_000,
  });

  collector.on("collect", async (button: ButtonInteraction) => {
    const [, ownerId, action] = button.customId.split(":");

    if (ownerId !== userId) {
      await button.reply({
        embeds: [createEmbed("error").setDescription("❌ Ce combat n'est pas le tien !")],
        ephemeral: true,
      });
      return;
    }

    if (fight.ended) return;

    if (action === "attack") {
      playerAttack(fight);
      if (fight.monsterHp <= 0) {
        await finishFight(fight, button, "victory");
        activeFights.delete(userId);
        collector.stop("ended");
        return;
      }
      monsterAttack(fight);
    } else if (action === "potion") {
      const consumed = consumeItem(guildId, userId, "potion");
      if (!consumed) {
        await button.reply({
          embeds: [createEmbed("error").setDescription("❌ Tu n'as plus de potion !")],
          ephemeral: true,
        });
        return;
      }
      const healed = Math.min(
        fight.playerMaxHp,
        fight.playerHp + POTION_HEAL,
      );
      pushLog(
        fight,
        `🧪 Tu bois une potion : **+${healed - fight.playerHp} PV**.`,
      );
      fight.playerHp = healed;
      monsterAttack(fight);
    } else if (action === "flee") {
      if (Math.random() < 0.5) {
        await finishFight(fight, button, "flee");
        activeFights.delete(userId);
        collector.stop("ended");
        return;
      }
      pushLog(fight, `🏃 La fuite a échoué !`);
      monsterAttack(fight);
    }

    // Mise à jour persistante des PV après chaque tour
    setHp(guildId, userId, fight.playerHp);

    if (fight.playerHp <= 0) {
      await finishFight(fight, button, "defeat");
      activeFights.delete(userId);
      collector.stop("ended");
      return;
    }

    await button.update({
      embeds: [buildEmbed(fight)],
      components: [buildButtons(fight)],
    });
  });

  collector.on("end", async (_collected, reason) => {
    if (reason === "ended" || fight.ended) return;
    // Temps écoulé : le joueur s'échappe sans récompense
    fight.ended = true;
    setHp(guildId, userId, fight.playerHp);
    updatePlayer(guildId, userId, { last_adventure: Date.now() });

    const embed = buildEmbed(fight);
    embed.setDescription(
      (embed.data.description ?? "") +
        "\n\n⌛ Trop lent ! Le monstre s'est enfui dans les bois.",
    );

    try {
      await interaction.editReply({
        embeds: [embed],
        components: [buildButtons(fight, true)],
      });
    } finally {
      activeFights.delete(userId);
    }
  });
}
