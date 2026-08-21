import { db } from "./db.js";

export interface Warning {
  id: number;
  guild_id: string;
  user_id: string;
  reason: string;
  moderator_id: string;
  created_at: number;
}

const insertWarning = db.prepare<[string, string, string, string]>(
  "INSERT INTO warnings (guild_id, user_id, reason, moderator_id) VALUES (?, ?, ?, ?)",
);

const selectWarnings = db.prepare<[string, string], Warning>(
  "SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY id",
);

const deleteWarning = db.prepare<[number, string, string]>(
  "DELETE FROM warnings WHERE id = ? AND guild_id = ? AND user_id = ?",
);

export function addWarning(
  guildId: string,
  userId: string,
  reason: string,
  moderatorId: string,
): void {
  insertWarning.run(guildId, userId, reason, moderatorId);
}

export function getWarnings(guildId: string, userId: string): Warning[] {
  return selectWarnings.all(guildId, userId);
}

/** @returns true si l'avertissement existait et a été supprimé. */
export function removeWarningById(
  guildId: string,
  userId: string,
  warningId: number,
): boolean {
  return deleteWarning.run(warningId, guildId, userId).changes > 0;
}
