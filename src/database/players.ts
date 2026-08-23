import { getPlayer as getJson, setPlayer as setJson, deletePlayer, playerToJson, maxHp as calcMaxHp, xpNeededFor as calcXpNeeded } from "./json-db.js";
import type { JsonPlayer } from "./json-db.js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface Player extends JsonPlayer {}
export function maxHp(level: number): number { return calcMaxHp(level); }
export function xpNeededFor(level: number): number { return calcXpNeeded(level); }
const REGEN_INTERVAL = 30_000;

export function getPlayer(guildId: string, userId: string): Player {
  let p = getJson(guildId, userId);
  if (!p) { p = playerToJson({ guild_id: guildId, user_id: userId }); setJson(guildId, userId, p); }
  const hpMax = calcMaxHp(p.level);
  if (p.hp < hpMax) {
    const elapsed = Date.now() - p.last_regen * 1000;
    const regen = Math.floor(elapsed / REGEN_INTERVAL);
    if (regen > 0) { p.hp = Math.min(hpMax, p.hp + regen); p.last_regen = Math.floor(Date.now()/1000); setJson(guildId, userId, p); }
  }
  return p as Player;
}
export function updatePlayer(guildId: string, userId: string, fields: Partial<Omit<Player,"guild_id"|"user_id">>): void {
  const p = getPlayer(guildId, userId); Object.assign(p, fields); setJson(guildId, userId, p);
}
export function setHp(guildId: string, userId: string, hp: number): void { updatePlayer(guildId, userId, { hp, last_regen: Math.floor(Date.now()/1000) } as any); }
export function addBalance(guildId: string, userId: string, amount: number): void { const p=getPlayer(guildId,userId); p.balance=Math.max(0,(p.balance??0)+amount); setJson(guildId,userId,p); }
export function removeBalance(guildId: string, userId: string, amount: number): boolean { const p=getPlayer(guildId,userId); if((p.balance??0)<amount) return false; p.balance-=amount; setJson(guildId,userId,p); return true; }
export interface XpResult { leveledUp:boolean; level:number; levelsGained:number; }
export function addXp(guildId: string, userId: string, amount: number): XpResult {
  const p=getPlayer(guildId,userId); let xp=p.xp+amount; let level=p.level;
  while(xp>=calcXpNeeded(level)){ xp-=calcXpNeeded(level); level++; }
  const leveledUp=level>p.level; const levelsGained=level-p.level; p.xp=xp; p.level=level; setJson(guildId,userId,p); return {leveledUp,level,levelsGained};
}
export interface LeaderboardRow { user_id:string; value:number; }
export function getLeaderboard(guildId: string, column:"balance"|"level"|"xp", limit=10): LeaderboardRow[] {
  try{
    const fp=join(process.cwd(),"data","players.json"); if(!existsSync(fp)) return [];
    const store: Record<string, JsonPlayer> = JSON.parse(readFileSync(fp,"utf-8"));
    return Object.values(store).filter(r=>r.guild_id===guildId).sort((a,b)=> (b as any)[column]-(a as any)[column]).slice(0,limit).map(r=>({user_id:r.user_id, value:(r as any)[column]}));
  }catch{ return []; }
}
export function resetPlayer(guildId: string, userId: string): void { deletePlayer(guildId,userId); }
export function incrementWins(guildId:string,userId:string):void { const p=getPlayer(guildId,userId); (p as any).wins=((p as any).wins??0)+1; setJson(guildId,userId,p); }
