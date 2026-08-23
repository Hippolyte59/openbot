import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Player } from "../database/players.ts";

const DATA_DIR = join(process.cwd(), "data");
const PLAYERS_FILE = join(DATA_DIR, "players.json");
const INVENTORY_FILE = join(DATA_DIR, "inventory.json");
const GUILDS_FILE = join(DATA_DIR, "guilds.json");
const WARNINGS_FILE = join(DATA_DIR, "warnings.json");
const VOICE_FILE = join(DATA_DIR, "voice.json");

function ensureDir(): void {
  mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown): void {
  ensureDir();
  writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- Players ----------
export interface JsonPlayer {
  guild_id: string;
  user_id: string;
  balance: number;
  xp: number;
  level: number;
  daily_streak: number;
  last_daily: number;
  last_work: number;
  hp: number;
  last_regen: number;
  last_adventure: number;
  last_activity: number;
  weapon: string | null;
  armor: string | null;
  created_at: number;
}

export function loadPlayers(): Map<string, Map<string, JsonPlayer>> {
  const raw = readJSON<Map<string, Map<string, JsonPlayer>>>(PLAYERS_FILE, new Map());
  return raw;
}

export function savePlayers(players: Map<string, Map<string, JsonPlayer>>): void {
  writeJSON(PLAYERS_FILE, players);
}

export function getPlayer(guildId: string, userId: string): JsonPlayer | undefined {
  const players = loadPlayers();
  const guild = players.get(guildId);
  return guild ? guild.get(userId) : undefined;
}

export function setPlayer(guildId: string, userId: string, player: JsonPlayer): void {
  const players = loadPlayers();
  if (!players.has(guildId)) players.set(guildId, new Map());
  players.get(guildId)!.set(userId, player);
  savePlayers(players);
}

// ---------- Inventory ----------
export interface JsonInventoryRow {
  guild_id: string;
  user_id: string;
  item_id: string;
  quantity: number;
}

export function loadInventory(): Map<string, Map<string, JsonInventoryRow>> {
  const raw = readJSON<Map<string, Map<string, JsonInventoryRow>>>(INVENTORY_FILE, new Map());
  return raw;
}

export function saveInventory(inventory: Map<string, Map<string, JsonInventoryRow>>): void {
  writeJSON(INVENTORY_FILE, inventory);
}

// ---------- Guilds config ----------
export interface GuildConfig {
  welcomeChannel?: string;
  goodbyeChannel?: string;
  welcomeMessage?: string;
  goodbyeMessage?: string;
  welcomeBanner?: string;
}

export function loadGuilds(): Map<string, GuildConfig> {
  const raw = readJSON<Map<string, GuildConfig>>(GUILDS_FILE, new Map());
  return raw;
}

export function saveGuilds(guilds: Map<string, GuildConfig>): void {
  writeJSON(GUILDS_FILE, guilds);
}

// ---------- Warnings ----------
export interface JsonWarning {
  id: number;
  guild_id: string;
  user_id: string;
  reason: string;
  moderator_id: string;
  created_at: number;
}

export function loadWarnings(): Map<string, JsonWarning[]> {
  const raw = readJSON<Map<string, JsonWarning[]>>(WARNINGS_FILE, new Map());
  return raw;
}

export function saveWarnings(warnings: Map<string, JsonWarning[]>): void {
  writeJSON(WARNINGS_FILE, warnings);
}

// ---------- Voice channels ----------
export interface JsonVoiceChannel {
  channel_id: string;
  guild_id: string;
  owner_id: string;
  message_id?: string;
}

export function loadVoice(): Map<string, JsonVoiceChannel> {
  const raw = readJSON<Map<string, JsonVoiceChannel>>(VOICE_FILE, new Map());
  return raw;
}

export function saveVoice(channels: Map<string, JsonVoiceChannel>): void {
  writeJSON(VOICE_FILE, channels);
}

export function insertWarning(guildId: string, userId: string, reason: string, moderatorId: string): JsonWarning {
  const warnings = loadWarnings();
  const guildWarns = warnings.get(guildId) || [];
  const id = guildWarns.length > 0 ? Math.max(...guildWarns.map(w => w.id), 0) + 1 : 1;
  const warning: JsonWarning = { id, guild_id: guildId, user_id: userId, reason, moderator_id: moderatorId, created_at: Math.floor(Date.now() / 1000) };
  guildWarns.push(warning);
  warnings.set(guildId, guildWarns);
  saveWarnings(warnings);
  return warning;
}

// Export helper: placeholder replacement
export function replacePlaceholders(message: string, data: {
  pseudo: string;
  mention: string;
  serverName: string;
  channelName?: string;
}): string {
  let result = message;
  result = result.replace(/{pseudo}/gi, data.pseudo);
  result = result.replace(/@{mention}/g, data.mention);
  result = result.replace(/{server_name}/g, data.serverName);
  if (data.channelName !== undefined) {
    result = result.replace(/{channel_name}/g, data.channelName);
  }
  return result;
}

export {};