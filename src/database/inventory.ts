import { db } from "./db.js";

interface InventoryRow {
  item_id: string;
  quantity: number;
}

const selectInventory = db.prepare<[string, string], InventoryRow>(
  "SELECT item_id, quantity FROM inventory WHERE guild_id = ? AND user_id = ? AND quantity > 0 ORDER BY item_id",
);
const selectItem = db.prepare<[string, string, string], InventoryRow | undefined>(
  "SELECT item_id, quantity FROM inventory WHERE guild_id = ? AND user_id = ? AND item_id = ?",
);
const upsertItem = db.prepare(`
  INSERT INTO inventory (guild_id, user_id, item_id, quantity) VALUES (?, ?, ?, ?)
  ON CONFLICT (guild_id, user_id, item_id) DO UPDATE SET quantity = quantity + excluded.quantity
`);
const consumeStmt = db.prepare(`
  UPDATE inventory SET quantity = quantity - ?
  WHERE guild_id = ? AND user_id = ? AND item_id = ? AND quantity >= ?
`);

export function getInventory(guildId: string, userId: string): InventoryRow[] {
  return selectInventory.all(guildId, userId);
}

export function getItemCount(
  guildId: string,
  userId: string,
  itemId: string,
): number {
  return selectItem.get(guildId, userId, itemId)?.quantity ?? 0;
}

export function addItem(
  guildId: string,
  userId: string,
  itemId: string,
  quantity = 1,
): void {
  upsertItem.run(guildId, userId, itemId, quantity);
}

/**
 * Consomme un objet de l'inventaire.
 * @returns true si l'objet a bien été consommé.
 */
export function consumeItem(
  guildId: string,
  userId: string,
  itemId: string,
  quantity = 1,
): boolean {
  const result = consumeStmt.run(quantity, guildId, userId, itemId, quantity);
  return result.changes > 0;
}

/** Vide entièrement l'inventaire d'un joueur (commande admin). */
export function clearInventory(guildId: string, userId: string): void {
  db.prepare(
    "DELETE FROM inventory WHERE guild_id = ? AND user_id = ?",
  ).run(guildId, userId);
}
