import { loadGuilds, defaultAutomod, type AutomodConfig, type AutomodSanction, insertWarning } from "../database/json-db.js";

const msgTimestamps = new Map<string, number[]>(); // key guildId:userId
const mentionTimestamps = new Map<string, number[]>();

function getCfg(guildId: string): AutomodConfig {
  const g = loadGuilds().get(guildId);
  return (g?.automod as AutomodConfig) ?? defaultAutomod();
}

function shouldIgnore(message:any, cfg:AutomodConfig): boolean {
  if (!cfg.enabled) return true;
  if (!message.guild) return true;
  if (message.author?.bot) return true;
  const perms = message.member?.permissions;
  if (perms?.has?.("ManageMessages") || perms?.has?.("Administrator")) return true;
  return false;
}

function containsInvite(text:string): boolean {
  return /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/i.test(text);
}
function inviteCodes(text:string): string[] {
  const m = [...text.matchAll(/discord\.(?:gg|com\/invite|app\.com\/invite)\/([a-zA-Z0-9-]+)/gi)];
  return m.map(x=>x[1].toLowerCase());
}
function containsLink(text:string): boolean {
  return /https?:\/\/\S+/i.test(text);
}
function countMarkdown(text:string): number {
  const marks = (text.match(/(\*\*|__|\*|_|~~|`|```|\|\|)/g) ?? []).length;
  return marks;
}
function countEmojis(text:string): number {
  const custom = (text.match(/<a?:\w+:\d+>/g) ?? []).length;
  const unicode = [...text].filter(c=> /\p{Extended_Pictographic}/u.test(c)).length;
  return custom + unicode;
}
function isMostlyUppercase(text:string, minLength:number, percent:number): boolean {
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letters.length < minLength) return false;
  const upper = (letters.match(/[A-ZÀ-Ý]/g) ?? []).length;
  return (upper / letters.length)*100 >= percent;
}

async function applySanction(message:any, sanction:AutomodSanction, reason:string, durationSec?:number): Promise<void> {
  const guild = message.guild;
  const member = message.member;
  try { await message.delete().catch(()=>{}); } catch {}
  if (!member || sanction === "none" || sanction === "delete") return;
  try {
    if (sanction === "warn") {
      insertWarning(guild.id, member.id, reason, message.client.user.id);
      await message.channel.send({ content: `<@${member.id}> averti: ${reason}` }).catch(()=>{});
      // check auto-sanctions
      const cfg = getCfg(guild.id);
      if (cfg.autoSanctions?.enabled) {
        const { loadWarnings } = await import("../database/json-db.js");
        const warns = (loadWarnings().get(guild.id) ?? []).filter(w=>w.user_id===member.id);
        if (warns.length >= (cfg.autoSanctions.warnThreshold ?? 3)) {
          const s = cfg.autoSanctions.sanction as AutomodSanction;
          const d = cfg.autoSanctions.durationSec;
          await applySanction(message, s, `Auto-sanction apres ${warns.length} warns`, d);
        }
      }
    } else if (sanction === "timeout" && member.moderatable) {
      const ms = (durationSec ?? 60) * 1000;
      await member.timeout(ms, reason).catch(()=>{});
    } else if (sanction === "kick" && member.kickable) {
      await member.kick(reason).catch(()=>{});
    } else if (sanction === "ban" && member.bannable) {
      await guild.members.ban(member.id, { reason }).catch(()=>{});
    }
  } catch {}
}

export async function handleAutomod(message:any): Promise<boolean> {
  const cfg = getCfg(message.guild?.id ?? "");
  if (shouldIgnore(message, cfg)) return false;
  const content: string = message.content ?? "";
  const textLower = content.toLowerCase();

  // 1 vocabulaire
  if (cfg.vocabulaire?.enabled && cfg.vocabulaire.mots?.length) {
    for (const w of cfg.vocabulaire.mots) {
      if (!w) continue;
      const esc = w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      if (new RegExp(`\\b${esc}\\b`, "i").test(textLower)) {
        const preset = cfg.sanctionsPredefinies?.["vocabulaire"];
        await applySanction(message, (preset?.sanction ?? cfg.vocabulaire.sanction) as AutomodSanction, preset?.reason ?? `Vocabulaire interdit: ${w}`, preset?.durationSec ?? cfg.vocabulaire.durationSec);
        return true;
      }
    }
  }

  // 2 liens
  if (cfg.liens?.enabled && containsLink(content)) {
    const allowed = (cfg.liens.allowDomains ?? []).map(d=>d.toLowerCase());
    const urls = [...content.matchAll(/https?:\/\/([^\s/]+)/gi)].map(m=>m[1].toLowerCase());
    const blocked = urls.filter(h=> !allowed.some(a=> h===a || h.endsWith("."+a)));
    if (blocked.length) {
      const preset = cfg.sanctionsPredefinies?.["lien"];
      await applySanction(message, (preset?.sanction ?? cfg.liens.sanction) as AutomodSanction, preset?.reason ?? "Lien non autorise", preset?.durationSec ?? cfg.liens.durationSec);
      return true;
    }
  }

  // 3 invitations
  if (cfg.invitations?.enabled && containsInvite(content)) {
    const codes = inviteCodes(content);
    const immunized = (cfg.invitations.immunizedGuilds ?? []).map(s=>s.toLowerCase());
    // immunized can be invite codes or guild ids (we check codes + raw guild id if fetchable)
    // if any code matches immunized, allow; otherwise block
    const isImmunized = codes.some(c=> immunized.includes(c));
    // also try to resolve guild id via fetchInvite if needed
    let allowByGuildId = false;
    if (!isImmunized && immunized.length) {
      for (const code of codes) {
        try {
          const inv:any = await message.client.fetchInvite(code).catch(()=>null);
          if (inv?.guild?.id && immunized.includes(inv.guild.id)) { allowByGuildId = true; break; }
        } catch {}
      }
    }
    if (!isImmunized && !allowByGuildId) {
      const preset = cfg.sanctionsPredefinies?.["invite"];
      await applySanction(message, (preset?.sanction ?? cfg.invitations.sanction) as AutomodSanction, preset?.reason ?? "Invitation non autorisee", preset?.durationSec ?? cfg.invitations.durationSec);
      return true;
    }
  }

  // 4 pings
  if (cfg.pings?.enabled) {
    const mentionCount = (message.mentions?.users?.size ?? 0) + (message.mentions?.roles?.size ?? 0);
    if (mentionCount > (cfg.pings.maxMentions ?? 5)) {
      const preset = cfg.sanctionsPredefinies?.["pings"];
      await applySanction(message, (preset?.sanction ?? cfg.pings.sanction) as AutomodSanction, preset?.reason ?? "Trop de mentions", preset?.durationSec ?? cfg.pings.durationSec);
      return true;
    }
  }

  // 5 markdown
  if (cfg.markdown?.enabled) {
    const ratio = content.length ? countMarkdown(content) / content.length : 0;
    const maxRatio = cfg.markdown.maxMarkdownRatio ?? 0.7;
    const maxChars = cfg.markdown.maxChars ?? 2000;
    if (content.length > maxChars || ratio > maxRatio) {
      await applySanction(message, cfg.markdown.sanction as AutomodSanction, "Markdown abusif", cfg.markdown.durationSec);
      return true;
    }
  }

  // 6 anti-spam
  const now = Date.now();
  const key = `${message.guild.id}:${message.author.id}`;
  // messages
  if (cfg.antiSpam?.messages?.enabled) {
    const arr = (msgTimestamps.get(key) ?? []).filter(t=> now - t < (cfg.antiSpam.messages.windowMs ?? 5000));
    arr.push(now);
    msgTimestamps.set(key, arr);
    if (arr.length > (cfg.antiSpam.messages.max ?? 5)) {
      const preset = cfg.sanctionsPredefinies?.["spam"];
      await applySanction(message, (preset?.sanction ?? cfg.antiSpam.messages.sanction) as AutomodSanction, preset?.reason ?? "Spam messages", preset?.durationSec ?? cfg.antiSpam.messages.durationSec);
      return true;
    }
  }
  // mentions antiSpam (rapid mentions)
  if (cfg.antiSpam?.mentions?.enabled) {
    const mentionCount = (message.mentions?.users?.size ?? 0) + (message.mentions?.roles?.size ?? 0);
    if (mentionCount > 0) {
      const arr = (mentionTimestamps.get(key) ?? []).filter(t=> now - t < (cfg.antiSpam.mentions.windowMs ?? 7000));
      for (let i=0;i<mentionCount;i++) arr.push(now);
      mentionTimestamps.set(key, arr);
      if (arr.length > (cfg.antiSpam.mentions.max ?? 5)) {
        await applySanction(message, cfg.antiSpam.mentions.sanction as AutomodSanction, "Spam mentions", cfg.antiSpam.mentions.durationSec);
        return true;
      }
    }
  }
  // emojis
  if (cfg.antiSpam?.emojis?.enabled) {
    const c = countEmojis(content);
    if (c > (cfg.antiSpam.emojis.max ?? 10)) {
      await applySanction(message, cfg.antiSpam.emojis.sanction as AutomodSanction, "Spam emojis", cfg.antiSpam.emojis.durationSec);
      return true;
    }
  }
  // majuscules
  if (cfg.antiSpam?.majuscules?.enabled) {
    if (isMostlyUppercase(content, cfg.antiSpam.majuscules.minLength ?? 10, cfg.antiSpam.majuscules.percent ?? 70)) {
      await applySanction(message, cfg.antiSpam.majuscules.sanction as AutomodSanction, "Majuscules abusives", cfg.antiSpam.majuscules.durationSec);
      return true;
    }
  }

  return false;
}

export function getAutomod(guildId:string): AutomodConfig { return getCfg(guildId); }
