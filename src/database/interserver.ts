import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface Interserver {
  id: string;
  name: string;
  guilds: { guildId: string; channelId: string }[];
  createdBy: string;
  createdAt: number;
}

const FILE = join(process.cwd(), "data", "interservers.json");

function load(): Interserver[] {
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, "utf-8")); } catch { return []; }
}
function save(data: Interserver[]): void {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function getAllInterservers(): Interserver[] { return load(); }
export function getInterserverByName(name: string): Interserver | undefined {
  return load().find(i => i.name.toLowerCase() === name.toLowerCase());
}
export function getInterserversByChannel(channelId: string): Interserver[] {
  return load().filter(i => i.guilds.some(g => g.channelId === channelId));
}
export function getInterserversByGuild(guildId: string): Interserver[] {
  return load().filter(i => i.guilds.some(g => g.guildId === guildId));
}
export function createInterserver(name: string, guildId: string, channelId: string, createdBy: string): Interserver {
  const interservers = load();
  if (interservers.some(i => i.name.toLowerCase() === name.toLowerCase())) throw new Error("Un interserveur avec ce nom existe déjà");
  const interserver: Interserver = { id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, name, guilds: [{ guildId, channelId }], createdBy, createdAt: Date.now() };
  interservers.push(interserver);
  save(interservers);
  return interserver;
}
export function joinInterserver(name: string, guildId: string, channelId: string): Interserver | null {
  const interservers = load();
  const interserver = interservers.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (!interserver) return null;
  if (interserver.guilds.some(g => g.guildId === guildId)) throw new Error("Ce serveur a déjà un salon dans cet interserveur");
  if (interserver.guilds.some(g => g.channelId === channelId)) throw new Error("Ce salon est déjà dans cet interserveur");
  interserver.guilds.push({ guildId, channelId });
  save(interservers);
  return interserver;
}
export function leaveInterserver(name: string, guildId: string): boolean {
  const interservers = load();
  const interserver = interservers.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (!interserver) return false;
  const before = interserver.guilds.length;
  interserver.guilds = interserver.guilds.filter(g => g.guildId !== guildId);
  if (interserver.guilds.length === 0) {
    const idx = interservers.indexOf(interserver);
    interservers.splice(idx, 1);
  }
  save(interservers);
  return before !== (interserver?.guilds.length ?? 0);
}
export function deleteInterserver(name: string): boolean {
  const interservers = load();
  const idx = interservers.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) return false;
  interservers.splice(idx, 1);
  save(interservers);
  return true;
}
