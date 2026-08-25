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
import { handleAutomod } from "../systems/automod.js";

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
  try { if (await handleAutomod(message)) return; } catch {}

  // Commandes personnalisées (préfixe !) + mentions {pseudo} {mention} etc.
  try{
    const { loadGuilds, replacePlaceholders } = await import("../database/json-db.js");
    const cfg:any = loadGuilds().get(message.guild.id);
    // Custom commands via !nom
    if (cfg?.customCommands && typeof message.content === "string" && message.content.startsWith("!")) {
      const raw = message.content.slice(1).split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9_-]/g,"");
      const cmd = raw ? cfg.customCommands[raw] : null;
      if (cmd) {
        const text = replacePlaceholders(cmd.response, {
          pseudo: message.author.username,
          mention: `<@${message.author.id}>`,
          serverName: message.guild.name,
          channelName: (message.channel as any)?.name ?? "",
          memberCount: message.guild.memberCount,
        }).replace(/{user}/gi, `<@${message.author.id}>`);
        const allowed = cmd.allowMentions ? { parse: ["users","roles","everyone"] as any } : { parse: [] as any };
        // handle @mentions in extra args : "!cmd @user" → replace {args}
        let finalText = text;
        if (text.includes("{args}")) {
          const args = message.content.slice(1+raw.length).trim();
          finalText = finalText.replace(/{args}/g, args || "");
        }
        // if response contains @, also support literal mentions
        await message.channel.send({ content: finalText, allowedMentions: allowed }).catch(()=>{});
        // don't return, still allow XP/word react below
      }
    }
    // Réactions de mots
    if (cfg?.wordReactions && typeof message.content === "string") {
      const lower = message.content.toLowerCase();
      for (const [word, emoji] of Object.entries(cfg.wordReactions as Record<string,string>)) {
        if (!word) continue;
        // word boundary check
        const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`\\b${esc}\\b`, "i");
        if (re.test(lower)) {
          try { await message.react(emoji); } catch {}
          break; // one per message to avoid spam
        }
      }
    }
  }catch{}

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
      .setTitle("Niveau supérieur !")
      .setDescription(
        [
          `Bravo ${message.author}, tu passes au niveau **${result.level}** !`,
          "",
          `Bonus : **+${bonus}** pièces`,
          `Encore **${xpNeededFor(result.level)} XP** avant le prochain niveau`,
        ].join("\n"),
      );

    await message.channel.send({ embeds: [embed] });
  } catch {

  }
}
