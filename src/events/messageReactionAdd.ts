import { Events } from "discord.js";
import { loadGuilds } from "../database/json-db.js";

function emojiKey(emoji:any): string {
  if (emoji.id) return `<:${emoji.name}:${emoji.id}>` // custom
  // also support <:name:id> and raw unicode
  return emoji.name ?? "";
}
function emojiVariants(key:string, emoji:any): string[] {
  const variants:string[]=[key];
  if(emoji.name) variants.push(emoji.name);
  if(emoji.id) variants.push(`<:${emoji.name}:${emoji.id}>`, `<a:${emoji.name}:${emoji.id}>`);
  // unicode vs string
  return [...new Set(variants)];
}

export const name = Events.MessageReactionAdd;

export async function execute(reaction:any, user:any): Promise<void>{
  try{
    if(user.bot) return;
    if(reaction.partial) try{ await reaction.fetch(); }catch{ return;}
    const msg = reaction.message;
    if(!msg?.guild) return;
    const guildId = msg.guild.id;
    const cfg:any = loadGuilds().get(guildId);
    if(!cfg?.reactionRoles) return;
    const map = cfg.reactionRoles[msg.id];
    if(!map) return;
    const key = emojiKey(reaction.emoji);
    const variants = emojiVariants(key, reaction.emoji);
    let roleId:string|undefined;
    for(const v of variants){ if(map[v]){ roleId=map[v]; break; } }
    if(!roleId && map[key]) roleId=map[key];
    // fallback: check unicode name directly (map keys may be raw emoji)
    if(!roleId){
      for(const [k,v] of Object.entries(map as Record<string,string>)){
        if(k===key || k===reaction.emoji.name) { roleId=v; break; }
      }
    }
    if(!roleId) return;
    const member = await msg.guild.members.fetch(user.id).catch(()=>null);
    if(!member) return;
    const role = msg.guild.roles.cache.get(roleId);
    if(!role || !role.editable) return;
    if(member.roles.cache.has(roleId)) return;
    await member.roles.add(roleId).catch(()=>{});
  }catch{}
}
