import { loadInventory, saveInventory, upsertItem as jsonUpsertItem } from "./json-db.js";

interface InventoryRow {
  item_id: string;
  quantity: number;
}

export function getInventory(guildId: string, userId: string): InventoryRow[] {
  const inventory = loadInventory();
  const guildInv = inventory.get(guildId);
  if (!guildInv) return [];
  return [...guildInv.values()].filter((row) => row.quantity > 0);
}

export function getItemCount(guildId: string, userId: string, itemId: string): number {
  const inventory = loadInventory();
  const guildInv = inventory.get(guildId);
  if (!guildInv) return 0;
  const row = [...guildInv.values()].find((r) => r.item_id === itemId);
  return row?.quantity ?? 0;
}

export function addItem(guildId: string, userId: string, itemId: string, quantity = 1): void {
  const inventory = loadInventory();
  if (!inventory.has(guildId)) inventory.set(guildId, new Map());
  
  const guildInv = inventory.get(guildId)!;
  const existing = existing?.item_id === itemId ? existing : undefined;
  
  // Simpler: always upsert
  jsonUpsertItem(guildId, userId, itemId, quantity);
  saveInventory(inventory);
}

export function consumeItem(
  guildId: string,
  userId: string,
  itemId: string,
  quantity = 1,
): boolean {
  const inventory = loadInventory();
  const guildInv = inventory.get(guildId);
  if (!guildInv) return false;
  
  const row = [...guildInv.values()].find((r) => r.item_id === itemId);
  if (!row || row.quantity < quantity) return false;
  
  row.quantity -= quantity;
  if (row.quantity <= 0) {
    guildInv.delete(row.item_id);
  }
  saveInventory(inventory);
  return true;
}

export function clearInventory(guildId: string, userId: string): void {
  const inventory = loadInventory();
  if (inventory.has(guildId)) {
    const guildInv = inventory.get(guildId)!;
    // Delete all items for this user in this guild
    for (const [key] of guildInv) {
      if (key.startsWith(userId + "_") || key === userId) {
        guildInv.delete(key);
      }
    }
    saveInventory(inventory);
  }
}