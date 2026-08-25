import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Client, TextChannel } from "discord.js";

export type ScheduledEventType = "giveaway" | "reminder" | "event";

export interface ScheduledEvent {
  id: string;
  guildId: string;
  channelId: string;
  type: ScheduledEventType;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  endsAt: number;
  data?: Record<string, any>;
  participants?: string[];
}

const FILE = join(process.cwd(), "data", "events.json");
function load(): ScheduledEvent[] {
  if (!existsSync(FILE)) return [];
  try { return JSON.parse(readFileSync(FILE, "utf-8")); } catch { return []; }
}
function save(events: ScheduledEvent[]): void {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(FILE, JSON.stringify(events, null, 2));
}

const timers = new Map<string, NodeJS.Timeout>();

export function getAllEvents(guildId?: string): ScheduledEvent[] {
  const all = load();
  return guildId ? all.filter(e => e.guildId === guildId) : all;
}

export function createEvent(event: Omit<ScheduledEvent, "id" | "createdAt">): ScheduledEvent {
  const newEvent: ScheduledEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    participants: [],
  };
  const events = load();
  events.push(newEvent);
  save(events);
  schedule(newEvent);
  return newEvent;
}

export function cancelEvent(id: string): boolean {
  const events = load();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  save(events);
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
  return true;
}

export function joinEvent(id: string, userId: string): boolean {
  const events = load();
  const ev = events.find(e => e.id === id);
  if (!ev || !ev.participants) return false;
  if (ev.participants.includes(userId)) return false;
  ev.participants.push(userId);
  save(events);
  return true;
}

function schedule(event: ScheduledEvent): void {
  const delay = event.endsAt - Date.now();
  if (delay <= 0) { void execute(event); return; }
  const t = setTimeout(() => void execute(event), delay);
  timers.set(event.id, t);
}

async function execute(event: ScheduledEvent): Promise<void> {
  timers.delete(event.id);
  // Remove from storage
  const events = load();
  const idx = events.findIndex(e => e.id === event.id);
  if (idx !== -1) { events.splice(idx, 1); save(events); }

  // Try to send result to channel if client is available
  try {
    const mod: any = await import("../index.js");
    const client = mod.client as Client;
    const guild = (client as Client).guilds.cache.get(event.guildId);
    const channel = guild?.channels.cache.get(event.channelId) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    if (event.type === "giveaway") {
      const participants = event.participants ?? [];
      if (participants.length === 0) {
        await channel.send(`Giveaway **${event.title}** terminé — aucun participant.`);
      } else {
        const winner = participants[Math.floor(Math.random() * participants.length)];
        await channel.send(`Giveaway **${event.title}** terminé ! Gagnant : <@${winner}> (${participants.length} participants) — ${event.description ?? ""}`);
      }
    } else if (event.type === "reminder") {
      await channel.send(`Rappel : **${event.title}** — ${event.description ?? ""} <@${event.createdBy}>`);
    } else {
      await channel.send(`Évènement **${event.title}** — ${event.description ?? ""}`);
    }
  } catch {}
}

export function initScheduler(client: Client): void {
  // Restore timers on startup
  for (const ev of load()) schedule(ev);
  // Also handle giveaway button interactions elsewhere
  console.log(`Scheduler prêt — ${load().length} évènement(s) en attente`);
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); const rs = s % 60;
  if (m < 60) return `${m}m ${rs}s`;
  const h = Math.floor(m / 60); const rm = m % 60;
  return `${h}h ${rm}m`;
}
