import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const FILE = join(process.cwd(),"data","admin_roles.json");
function load(): Record<string,string[]> { if(!existsSync(FILE)) return {}; try{ return JSON.parse(readFileSync(FILE,"utf-8")); }catch{ return {}; } }
function save(d:Record<string,string[]>){ mkdirSync(join(process.cwd(),"data"),{recursive:true}); writeFileSync(FILE, JSON.stringify(d,null,2)); }
export function getAdminRoles(guildId:string): string[] { return load()[guildId] ?? []; }
export function addAdminRole(guildId:string, roleId:string): boolean {
  const d=load(); const arr=d[guildId]??[]; if(arr.includes(roleId)) return false; arr.push(roleId); d[guildId]=arr; save(d); return true;
}
export function removeAdminRole(guildId:string, roleId:string): boolean {
  const d=load(); const arr=d[guildId]??[]; const i=arr.indexOf(roleId); if(i===-1) return false; arr.splice(i,1); d[guildId]=arr; save(d); return true;
}
