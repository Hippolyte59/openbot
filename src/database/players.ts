import { db } from "./db.js";

export interface Player {
  guild_id: string;
  user_id: string;
  balance: number;
  xp: number;
  level: number;
  daily_streak: number;
  last_daily: number;
  last_work: number;
}

const insertPlayer = db.prepare<[string, string]>(
  "INSERT OR IGNORE INTO players (guild_id, user_id) VALUES (?, ?)",
);
const selectPlayer = db.prepare<[string, string], Player>(
  "SELECT * FROM players WHERE guild_id = ? AND user_id = ?",
);

/** XP totale nécessaire pour passer du niveau `level` au suivant. */
export function xpNeededFor(level: number): number {
  return 100 * level * level;
}

export function getPlayer(guildId: string, userId: string): Player {
  insertPlayer.run(guildId, userId);
  return selectPlayer.get(guildId, userId) as Player;
}

export function updatePlayer(
  guildId: string,
  userId: string,
  fields: Partial<Omit<Player, "guild_id" | "user_id">>,
): void {
  const columns = Object.keys(fields);
  if (columns.length === 0) return;

  const setSql = columns.map((c) => `${c} = ?`).join(", ");
  const values = columns.map(
    (c) => fields[c as keyof typeof fields] as string | number,
  );
  db.prepare(
    `UPDATE players SET ${setSql} WHERE guild_id = ? AND user_id = ?`,
  ).run(...values, guildId, userId);
}

export function addBalance(
  guildId: string,
  userId: string,
  amount: number,
): void {
  getPlayer(guildId, userId);
  db.prepare(
    "UPDATE players SET balance = MAX(0, balance + ?) WHERE guild_id = ? AND user_id = ?",
  ).run(amount, guildId, userId);
}

/**
 * Retire de l'argent si le joueur en a assez.
 * @returns true si le retrait a réussi.
 */
export function removeBalance(
  guildId: string,
  userId: string,
  amount: number,
): boolean {
  getPlayer(guildId, userId);
  const result = db
    .prepare(
      "UPDATE players SET balance = balance - ? WHERE guild_id = ? AND user_id = ? AND balance >= ?",
    )
    .run(amount, guildId, userId, amount);
  return result.changes > 0;
}

export interface XpResult {
  leveledUp: boolean;
  level: number;
  levelsGained: number;
}

/** Ajoute de l'XP et gère les montées de niveau. */
export function addXp(
  guildId: string,
  userId: string,
  amount: number,
): XpResult {
  const player = getPlayer(guildId, userId);
  let xp = player.xp + amount;
  let level = player.level;

  while (xp >= xpNeededFor(level)) {
    xp -= xpNeededFor(level);
    level++;
  }

  updatePlayer(guildId, userId, { xp, level });

  return {
    leveledUp: level > player.level,
    level,
    levelsGained: level - player.level,
  };
}

export interface LeaderboardRow {
  user_id: string;
  value: number;
}

export function getLeaderboard(
  guildId: string,
  column: "balance" | "level" | "xp",
  limit = 10,
): LeaderboardRow[] {
  return db
    .prepare<[string, number], LeaderboardRow>(
      `SELECT user_id, ${column} AS value FROM players WHERE guild_id = ? ORDER BY ${column} DESC LIMIT ?`,
    )
    .all(guildId, limit);
}
