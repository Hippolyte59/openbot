import { Events, type Message } from "discord.js";
import { config } from "../config.js";
import {
  addBalance,
  addXp,
  getPlayer,
  xpNeededFor,
} from "../database/players.js";
import { createEmbed } from "../utils/embeds.js";
import { randomInt } from "../utils/random.js";
import { handleInterserverMessage } from "../systems/interserver.js";

export const name = Events.MessageCreate;

const xpCooldowns = new Map<string, number>();

function pruneCooldowns(now: number): void {
  if (xpCooldowns.size < 5000) return;
  for (const [key, expiry] of xpCooldowns) {
    if (expiry <= now) xpCooldowns.delete(key);
  }
}

export async function execute(message: any): Promise<void> {
  void handleInterserverMessage(message).catch(()=>{});
  if (!message.guild || message.author.bot) return;

  const now = Date.now();
  const key = `${message.guild.id}:${message.author.id}`;

  if ((xpCooldowns.get(key) ?? 0) > now) return;

  pruneCooldowns(now);
  xpCooldowns.set(key, now + config.cooldowns.xp);

  const result = addXp(
    message.guild.id,
    message.author.id,
    randomInt(config.xpPerMessage.min, config.xpPerMessage.max),
  );

  if (result.leveledUp) {
    void import("../database/players.js").then(m=> m.handleLevelUpRewards(message.guild.id, message.author.id, result.level, message.client).catch(()=>{}));
  }

  if (!result.leveledUp) return;
  if (!("send" in message.channel)) return;

  const bonus = result.level * 10 * result.levelsGained;
  addBalance(message.guild.id, message.author.id, bonus);

  try {
    const embed = createEmbed()
      .setTitle("🎉 Niveau supérieur !")
      .setDescription(
        [
          `Bravo ${message.author}, tu passes au niveau **${result.level}** !`,
          "",
          `💰 Bonus : **+${bonus}** pièces`,
          `📈 Encore **${xpNeededFor(result.level)} XP** avant le prochain niveau`,
        ].join("\n"),
      );

    await message.channel.send({ embeds: [embed] });
  } catch {

  }
}
