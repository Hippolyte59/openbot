import { loadInventoryStore, saveInventoryStore } from "./json-db.js";
import type { JsonInventoryRow } from "./json-db.js";

function key(g:string,u:string,i:string){ return `${g}:${u}:${i}`; }

export function getInventory(guildId:string,userId:string): JsonInventoryRow[] {
  const store=loadInventoryStore();
  return Object.values(store).filter(r=>r.guild_id===guildId && r.user_id===userId && r.quantity>0);
}
export function getItemCount(guildId:string,userId:string,itemId:string): number {
  return loadInventoryStore()[key(guildId,userId,itemId)]?.quantity ?? 0;
}
export function addItem(guildId:string,userId:string,itemId:string,quantity=1): void {
  const s=loadInventoryStore(); const k=key(guildId,userId,itemId);
  const cur=s[k]; if(cur) cur.quantity+=quantity; else s[k]={guild_id:guildId,user_id:userId,item_id:itemId,quantity};
  saveInventoryStore(s);
}
export function consumeItem(guildId:string,userId:string,itemId:string,quantity=1): boolean {
  const s=loadInventoryStore(); const k=key(guildId,userId,itemId); const cur=s[k];
  if(!cur || cur.quantity<quantity) return false;
  cur.quantity-=quantity; if(cur.quantity<=0) delete s[k]; saveInventoryStore(s); return true;
}
export function clearInventory(guildId:string,userId:string): void {
  const s=loadInventoryStore();
  for(const k of Object.keys(s)){ if(k.startsWith(`${guildId}:${userId}:`)) delete s[k]; }
  saveInventoryStore(s);
}
