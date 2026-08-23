import { loadWarnings, saveWarnings, insertWarning as jsonInsert } from "./json-db.js";
import type { JsonWarning } from "./json-db.js";
export interface Warning extends JsonWarning {}
export function addWarning(guildId:string,userId:string,reason:string,moderatorId:string): void { jsonInsert(guildId,userId,reason,moderatorId); }
export function getWarnings(guildId:string,userId:string): Warning[] {
  return (loadWarnings().get(guildId) ?? []).filter(w=>w.user_id===userId);
}
export function removeWarningById(guildId:string,userId:string,warningId:number): boolean {
  const m=loadWarnings(); const arr=m.get(guildId)??[]; const idx=arr.findIndex(w=>w.id===warningId && w.user_id===userId);
  if(idx===-1) return false; arr.splice(idx,1); m.set(guildId,arr); saveWarnings(m); return true;
}
