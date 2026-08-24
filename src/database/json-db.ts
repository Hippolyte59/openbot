import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
function ensureDir(): void { mkdirSync(DATA_DIR, { recursive: true }); }
function readJSON<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try { return JSON.parse(readFileSync(file, "utf-8")) as T; } catch { return fallback; }
}
function writeJSON(file: string, data: unknown): void { ensureDir(); writeFileSync(file, JSON.stringify(data, null, 2)); }

// ---------- Players ----------
export interface JsonPlayer {
  guild_id: string; user_id: string; balance: number; xp: number; level: number;
  daily_streak: number; last_daily: number; last_work: number; hp: number;
  last_regen: number; last_adventure: number; last_activity: number;
  weapon: string | null; armor: string | null; animal: string | null;
  animal_name: string | null; partner: string | null; wins: number; created_at: number;
}
type PlayersStore = Record<string, JsonPlayer>;
const PLAYERS_FILE = join(DATA_DIR, "players.json");
export function loadPlayersStore(): PlayersStore { return readJSON<PlayersStore>(PLAYERS_FILE, {}); }
export function savePlayersStore(s: PlayersStore): void { writeJSON(PLAYERS_FILE, s); }
export function getPlayer(guildId: string, userId: string): JsonPlayer | undefined { return loadPlayersStore()[`${guildId}:${userId}`]; }
export function setPlayer(guildId: string, userId: string, player: JsonPlayer): void { const s=loadPlayersStore(); s[`${guildId}:${userId}`]=player; savePlayersStore(s); }
export function deletePlayer(guildId: string, userId: string): void { const s=loadPlayersStore(); delete s[`${guildId}:${userId}`]; savePlayersStore(s); }
export function maxHp(level: number): number { return 90 + level * 10; }
export function xpNeededFor(level: number): number { return 100 * level * level; }
export function playerToJson(p: Partial<JsonPlayer> & { guild_id: string; user_id: string }): JsonPlayer {
  const now=Math.floor(Date.now()/1000);
  return { balance:0,xp:0,level:1,daily_streak:0,last_daily:0,last_work:0,hp:100,last_regen:now,last_adventure:0,last_activity:now,weapon:null,armor:null,animal:null,animal_name:null,partner:null,wins:0,created_at:now, ...p };
}

// ---------- Inventory ----------
export interface JsonInventoryRow { guild_id: string; user_id: string; item_id: string; quantity: number; }
type InventoryStore = Record<string, JsonInventoryRow>;
const INVENTORY_FILE = join(DATA_DIR, "inventory.json");
export function loadInventoryStore(): InventoryStore { return readJSON<InventoryStore>(INVENTORY_FILE, {}); }
export function saveInventoryStore(s: InventoryStore): void { writeJSON(INVENTORY_FILE, s); }

// ---------- Guilds config ----------
export interface LogEntry { color: string; channelId: string; avatarUrl?: string; }
export interface CustomCommand { response: string; description?: string; allowMentions?: boolean; createdAt?: number; }
export interface GuildConfig { welcomeChannel?: string; goodbyeChannel?: string; welcomeMessage?: string; goodbyeMessage?: string; welcomeBanner?: string; goodbyeBanner?: string; levelColor?: string; economyColor?: string; embedColor?: string; maxLevel?: number; maxLevelRoleId?: string; privilegedRoleId?: string; privilegedChannelId?: string; birthdayRoleId?: string; birthdayChannelId?: string; birthdayMessage?: string; logs?: Record<string, LogEntry>; birthdays?: Record<string, { month: number; day: number }>; autoRoles?: string[]; customCommands?: Record<string, CustomCommand>; reactionRoles?: Record<string, Record<string, string>>; wordReactions?: Record<string, string>; }
type GuildsStore = Record<string, GuildConfig>;
const GUILDS_FILE = join(DATA_DIR, "guilds.json");
export function loadGuilds(): Map<string, GuildConfig> { return new Map(Object.entries(readJSON<GuildsStore>(GUILDS_FILE, {}))); }
export function saveGuilds(guilds: Map<string, GuildConfig>): void { writeJSON(GUILDS_FILE, Object.fromEntries(guilds)); }

// ---------- Birthdays ----------
export interface Birthday { month: number; day: number; }
type BirthdaysStore = Record<string, Birthday>; // key: "guildId:userId"
const BIRTHDAYS_FILE = join(DATA_DIR, "birthdays.json");
export function loadBirthdays(): BirthdaysStore { return readJSON<BirthdaysStore>(BIRTHDAYS_FILE, {}); }
export function saveBirthdays(b: BirthdaysStore): void { writeJSON(BIRTHDAYS_FILE, JSON.stringify(b, null, 2)); }
export function setBirthday(guildId: string, userId: string, month: number, day: number): void { const s = loadBirthdays(); s[`${guildId}:${userId}`] = { month, day }; saveBirthdays(s); }
export function deleteBirthday(guildId: string, userId: string): void { const s = loadBirthdays(); delete s[`${guildId}:${userId}`]; saveBirthdays(s); }
export function getBirthday(guildId: string, userId: string): Birthday | undefined { return loadBirthdays()[`${guildId}:${userId}`]; }
export interface JsonWarning { id:number; guild_id:string; user_id:string; reason:string; moderator_id:string; created_at:number; }
type WarningsStore = Record<string, JsonWarning[]>;
const WARNINGS_FILE = join(DATA_DIR, "warnings.json");
export function loadWarnings(): Map<string, JsonWarning[]> { return new Map(Object.entries(readJSON<WarningsStore>(WARNINGS_FILE, {}))); }
export function saveWarnings(warnings: Map<string, JsonWarning[]>): void { writeJSON(WARNINGS_FILE, Object.fromEntries(warnings)); }
export function insertWarning(guildId:string,userId:string,reason:string,moderatorId:string): JsonWarning {
  const warnings=loadWarnings(); const arr=warnings.get(guildId)??[]; const id=arr.length?Math.max(...arr.map(w=>w.id))+1:1;
  const w:JsonWarning={id,guild_id:guildId,user_id:userId,reason,moderator_id:moderatorId,created_at:Math.floor(Date.now()/1000)};
  arr.push(w); warnings.set(guildId,arr); saveWarnings(warnings); return w;
}

// ---------- Voice channels ----------
export interface JsonVoiceChannel { channel_id:string; guild_id:string; owner_id:string; message_id?:string; }
type VoiceStore = Record<string, JsonVoiceChannel>;
const VOICE_FILE = join(DATA_DIR, "voice.json");
export function loadVoice(): Map<string, JsonVoiceChannel> { return new Map(Object.entries(readJSON<VoiceStore>(VOICE_FILE, {}))); }
export function saveVoice(channels: Map<string, JsonVoiceChannel>): void { writeJSON(VOICE_FILE, Object.fromEntries(channels)); }

export function replacePlaceholders(message:string, data:{pseudo:string; mention:string; serverName:string; channelName?:string; memberCount?:number}): string {
  let r=message; r=r.replace(/{pseudo}/gi,data.pseudo); r=r.replace(/{@?mention}/g,data.mention); r=r.replace(/{server_name}/g,data.serverName); if(data.channelName) r=r.replace(/{channel_name}/g,data.channelName); if(data.memberCount!==undefined) r=r.replace(/{memberCount}/g,String(data.memberCount)); return r;
}
