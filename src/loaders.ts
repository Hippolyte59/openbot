import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import type { Collection } from "discord.js";
import type { Command, CommandData } from "./types.js";

export async function loadCommands(
  collection: any,
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
    const command = (module.default ?? module) as Command;

    if (!command?.data || typeof command.execute !== "function") {
      console.warn(` La commande "${file}" est invalide (data/execute manquants).`);
      continue;
    }

    collection.set(command.data.name, command);
    jsonCommands.push(command.data);
  }

  console.log(`${collection.size} commande(s) chargée(s).`);
  return jsonCommands;
}
