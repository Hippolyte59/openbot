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

/** PV maximum selon le niveau. */
export function maxHp(level: number): number {
  return 90 + level * 10;
}

/** Régénération : 1 PV toutes les 30 secondes. */
const REGEN_INTERVAL = 30_000;

/** XP totale nécessaire pour passer du niveau `level` au suivant. */
export function xpNeededFor(level: number): number {
  return 100 * level * level;
}

const insertPlayer = db.prepare<[string, string, number]>(
  "INSERT OR IGNORE INTO players (guild_id, user_id, hp, last_regen) VALUES (?, ?, 100, ?)",
);
const selectPlayer = db.prepare<[string, string], Player>(
  "SELECT * FROM players WHERE guild_id = ? AND user_id = ?",
);

export function updatePlayer(
  guildId: string,
  userId: string,
  fields: Partial<Omit<Player, "guild_id" | "user_id">>,
): void {
  const columns = Object.keys(fields);
  if (columns.length === 0) return;

  // Garantit que la ligne existe (UPDATE sans effet sinon)
  insertPlayer.run(guildId, userId, Date.now());

  const setSql = columns.map((c) => `${c} = ?`).join(", ");
  const values = columns.map(
    (c) => fields[c as keyof typeof fields] as string | number | null,
  );
  db.prepare(
    `UPDATE players SET ${setSql} WHERE guild_id = ? AND user_id = ?`,
  ).run(...values, guildId, userId);
}

/**
 * Récupère le joueur (le crée si besoin) et applique la régénération
 * passive des PV depuis la dernière visite.
 */
export function getPlayer(guildId: string, userId: string): Player {
  insertPlayer.run(guildId, userId, Date.now());
  const player = selectPlayer.get(guildId, userId) as Player;

  const hpMax = maxHp(player.level);
  if (player.hp < hpMax) {
    const elapsed = Date.now() - player.last_regen;
    const regen = Math.floor(elapsed / REGEN_INTERVAL);
    if (regen > 0) {
      player.hp = Math.min(hpMax, player.hp + regen);
      player.last_regen = Date.now();
      updatePlayer(guildId, userId, {
        hp: player.hp,
        last_regen: player.last_regen,
      });
    }
  }

  return player;
}

/** Modifie les PV et réinitialise le compteur de régénération. */
export function setHp(
  guildId: string,
  userId: string,
  hp: number,
): void {
  updatePlayer(guildId, userId, { hp, last_regen: Date.now() });
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

/** Supprime complètement le profil d'un joueur (commande admin). */
export function resetPlayer(guildId: string, userId: string): void {
  db.prepare(
    "DELETE FROM players WHERE guild_id = ? AND user_id = ?",
  ).run(guildId, userId);
}

/** Compte une victoire d'aventure supplémentaire. */
export function incrementWins(guildId: string, userId: string): void {
  getPlayer(guildId, userId);
  db.prepare(
    "UPDATE players SET wins = wins + 1 WHERE guild_id = ? AND user_id = ?",
  ).run(guildId, userId);
}
