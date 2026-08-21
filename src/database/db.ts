import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });

export const db = new Database(path.join(process.cwd(), "data", "bot.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    guild_id       TEXT NOT NULL,
    user_id        TEXT NOT NULL,
    balance        INTEGER NOT NULL DEFAULT 0,
    xp             INTEGER NOT NULL DEFAULT 0,
    level          INTEGER NOT NULL DEFAULT 1,
    daily_streak   INTEGER NOT NULL DEFAULT 0,
    last_daily     INTEGER NOT NULL DEFAULT 0,
    last_work      INTEGER NOT NULL DEFAULT 0,
    hp             INTEGER NOT NULL DEFAULT 100,
    last_regen     INTEGER NOT NULL DEFAULT 0,
    last_adventure INTEGER NOT NULL DEFAULT 0,
    weapon         TEXT,
    armor          TEXT,
    created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    guild_id   TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    item_id    TEXT NOT NULL,
    quantity   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS admin_roles (
    guild_id   TEXT NOT NULL,
    role_id    TEXT NOT NULL,
    PRIMARY KEY (guild_id, role_id)
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id      TEXT NOT NULL,
    user_id       TEXT NOT NULL,
    reason        TEXT NOT NULL,
    moderator_id  TEXT NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS voice_channels (
    channel_id  TEXT PRIMARY KEY,
    guild_id    TEXT NOT NULL,
    owner_id    TEXT NOT NULL,
    message_id  TEXT
  );
`);

// Migrations légères : ajoute les colonnes récentes aux bases existantes
const migrations = [
  "ALTER TABLE players ADD COLUMN hp INTEGER NOT NULL DEFAULT 100",
  "ALTER TABLE players ADD COLUMN last_regen INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE players ADD COLUMN last_adventure INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE players ADD COLUMN weapon TEXT",
  "ALTER TABLE players ADD COLUMN armor TEXT",
  "ALTER TABLE players ADD COLUMN animal TEXT",
  "ALTER TABLE players ADD COLUMN animal_name TEXT",
  "ALTER TABLE players ADD COLUMN partner TEXT",
  "ALTER TABLE players ADD COLUMN wins INTEGER NOT NULL DEFAULT 0",
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch {
    // Colonne déjà présente : rien à faire
  }
}
