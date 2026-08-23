import { loadVoice, saveVoice } from "./json-db.js";
import type { JsonVoiceChannel } from "./json-db.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
export interface VoiceChannelRow { channel_id:string; guild_id:string; owner_id:string; message_id:string|null; }
export interface VoiceHubRow { guild_id:string; channel_id:string; }
const HUB_FILE = join(process.cwd(),"data","voice_hubs.json");
function loadHubs(): Record<string,string>{ if(!existsSync(HUB_FILE)) return {}; try{return JSON.parse(readFileSync(HUB_FILE,"utf-8"));}catch{return {};} }
function saveHubs(d:Record<string,string>){ mkdirSync(join(process.cwd(),"data"),{recursive:true}); writeFileSync(HUB_FILE, JSON.stringify(d,null,2)); }
export function saveVoiceChannel(channelId:string,guildId:string,ownerId:string,messageId:string|null): void {
  const m=loadVoice(); m.set(channelId,{channel_id:channelId,guild_id:guildId,owner_id:ownerId,message_id:messageId??undefined}); saveVoice(m);
}
export function getVoiceChannel(channelId:string): VoiceChannelRow|undefined {
  const r=loadVoice().get(channelId); return r?{channel_id:r.channel_id,guild_id:r.guild_id,owner_id:r.owner_id,message_id:r.message_id??null}:undefined;
}
export function findVoiceChannelByOwner(guildId:string,ownerId:string): VoiceChannelRow|undefined {
  for(const v of loadVoice().values()){ if(v.guild_id===guildId && v.owner_id===ownerId) return {channel_id:v.channel_id,guild_id:v.guild_id,owner_id:v.owner_id,message_id:v.message_id??null}; } return undefined;
}
export function deleteVoiceChannel(channelId:string): void { const m=loadVoice(); m.delete(channelId); saveVoice(m); }
export function setVoicePanelMessage(channelId:string,messageId:string|null): void {
  const m=loadVoice(); const r=m.get(channelId); if(r){ r.message_id=messageId??undefined; m.set(channelId,r); saveVoice(m); }
}
export function transferVoiceOwnership(channelId:string,newOwnerId:string): void {
  const m=loadVoice(); const r=m.get(channelId); if(r){ r.owner_id=newOwnerId; m.set(channelId,r); saveVoice(m); }
}
export function setVoiceHub(guildId:string,channelId:string): void { const d=loadHubs(); d[guildId]=channelId; saveHubs(d); }
export function getVoiceHub(guildId:string): VoiceHubRow|undefined { const d=loadHubs(); const c=d[guildId]; return c?{guild_id:guildId,channel_id:c}:undefined; }
export function removeVoiceHubByGuild(guildId:string): void { const d=loadHubs(); delete d[guildId]; saveHubs(d); }
export function removeVoiceHubByChannel(channelId:string): void { const d=loadHubs(); for(const k of Object.keys(d)){ if(d[k]===channelId) delete d[k]; } saveHubs(d); }
