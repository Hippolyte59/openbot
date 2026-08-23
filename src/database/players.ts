import { getPlayer, setPlayer, loadPlayers, savePlayers, maxHp, xpNeededFor, playerToInterface, JsonPlayer } from "./json-db.js";

export interface Player {
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
  weapon: string | null;
  armor: string | null;
  animal: string | null;
  animal_name: string | null;
  partner: string | null;
  wins: number;
}

export function maxHp(level: number): number {
  return 90 + level * 10;
}

const REGEN_INTERVAL = 30_000;

export function xpNeededFor(level: number): number {
  return 100 * level * level;
}

function createNewPlayer(guildId: string, userId: string, hp: number): JsonPlayer {
  const now = Math.floor(Date.now() / 1000);
  return {
    guild_id: guildId,
    user_id: userId,
    balance: 0,
    xp: 0,
    level: 1,
    daily_streak: 0,
    last_daily: 0,
    last_work: 0,
    hp,
    last_regen: now,
    last_adventure: 0,
    last_activity: now,
    weapon: null,
    armor: null,
    created_at: now,
  };
}

function insertPlayerInternal(guildId: string, userId: string, hp: number, lastRegen: number): void {
  const player = createNewPlayer(guildId, userId, hp);
  setPlayer(guildId, userId, player);
}

const insertPlayer = insertPlayerInternal;

const selectPlayer = (guildId: string, userId: string): Player | undefined => {
  const player = getPlayer(guildId, userId);
  return player ? playerToInterface(player) : undefined;
};

export function updatePlayer(
  guildId: string,
  userId: string,
  fields: Partial<Omit<Player, "guild_id" | "user_id">>,
): void {
  const player = getPlayer(guildId, userId) ||
    { guild_id: guildId, user_id: userId, balance: 0, xp: 0, level: 1, daily_streak: 0, last_daily: 0, last_work: 0, hp: 100, last_regen: 0, last_adventure: 0, weapon: null, armor: null } as Player;

  const updated = { ...player, ...fields };
  setPlayer(guildId, userId, { ...playerToInterface(updated), guild_id: guildId, user_id: userId } as JsonPlayer);

  // Regen logic
  const hpMax = maxHp(updated.level);
  if (updated.hp < hpMax) {
    const elapsed = Date.now() - (updated.last_regen ?? 0);
    const regen = Math.floor(elapsed / REGEN_INTERVAL);
    if (regen > 0) {
      updated.hp = Math.min(hpMax, updated.hp + regen);
      setPlayer(guildId, userId, { ...updated, last_regen: Date.now() });
    }
  }
}

export function getPlayer(guildId: string, userId: string): Player {
  const player = selectPlayer(guildId, userId);
  if (!player) {
    insertPlayerInternal(guildId, userId, 100, Date.now());
    return getPlayer(guildId, userId);
  }
  return player;
}

export function setHp(guildId: string, userId: string, hp: number): void {
  const player = getPlayer(guildId, userId);
  setPlayer(guildId, userId, { ...player, hp, last_regen: Date.now() });
}

export function addBalance(guildId: string, userId: string, amount: number): void {
  const player = getPlayer(guildId, userId);
  setPlayer(guildId, userId, { ...player, balance: Math.max(0, (player.balance ?? 0) + amount) });
}

export function removeBalance(guildId: string, userId: string, amount: number): boolean {
  const player = getPlayer(guildId, userId);
  const newBalance = (player.balance ?? 0) - amount;
  if (newBalance >= 0) {
    setPlayer(guildId, userId, { ...player, balance: newBalance });
    return true;
  }
  return false;
}

export interface XpResult {
  leveledUp: boolean;
  level: number;
  levelsGained: number;
}

export function addXp(guildId: string, userId: string, amount: number): XpResult {
  const player = getPlayer(guildId, userId);
  let xp = player.xp + amount;
  let level = player.level;

  while (xp >= xpNeededFor(level)) {
    xp -= xpNeededFor(level);
    level++;
  }

  setPlayer(guildId, userId, { ...player, xp, level });

  return {
    leveledUp: level > player.level,
    level,
    levelsGained: level - player.level,
  };
}

export function resetPlayer(guildId: string, userId: string): void {
  const players = loadPlayers();
  const key = guildId + "_" + userId;
  players.delete(key);
  savePlayers(players);
}

export function incrementWins(guildId: string, userId: string): void {
  const player = getPlayer(guildId, userId);
  setPlayer(guildId, userId, { ...player, wins: (player.wins ?? 0) + 1 });
}