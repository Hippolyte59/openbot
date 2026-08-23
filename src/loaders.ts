import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { Collection } from "discord.js";
import type { Command, CommandData } from "./types.js";

export async function loadCommands(
  collection: Collection<string, Command>,
): Promise<CommandData[]> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.join(currentDir, "commands");

  const files = readdirSync(dir).filter(
    (file) => /\.(js|ts)$/.test(file) && !file.endsWith(".d.ts"),
  );

  const jsonCommands: CommandData[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const module = await import(pathToFileURL(filePath).href);
    const command = module.default ?? module as Command;

    if (!command?.data || typeof command.execute !== "function") {
      console.warn(`⚠️  La commande "${file}" est invalide (data/execute manquants).`);
      continue;
    }

    collection.set(command.data.name, command);
    jsonCommands.push(command.data);
  }

  console.log(`📦 ${collection.size} commande(s) chargée(s).`);
  return jsonCommands;
}

export async function loadEvents(
  client: import("discord.js").Client,
  eventsMap: Map<string, { name: string; once?: boolean; execute: Function }>
): Promise<void> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.join(currentDir, "events");

  const files = readdirSync(dir).filter(
    (file) => /\.(js|ts)$/.test(file) && !file.endsWith(".d.ts"),
  );

  for (const file of files) {
    const filePath = path.join(dir, file);
    const module = await import(pathToFileURL(filePath).href);
    const event = module.default ?? module as {
      name: string;
      once?: boolean;
      execute: Function;
    };

    if (!event?.name || !event?.execute) {
      console.warn(`⚠️  L'événement "${file}" est invalide (name/execute manquants).`);
      continue;
    }

    const executeOnce = event.once === true;

    client.on(event.name, async (...args: any[]) => {
      try {
        await event.execute(...args);
      } catch (err) {
        console.error(`❌ Erreur dans l'événement ${event.name} :`, err);
      }
    });

    if (executeOnce) {
      // The listener will automatically only fire once if the event is "once"
      // but we keep it registered for simplicity
    }
  }

  console.log(`📅 ${eventsMap.size} événement(s) chargé(s).`);
}