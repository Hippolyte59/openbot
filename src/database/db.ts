import { db } from "./json-db.js";
import { loadPlayers, savePlayers, getPlayer, setPlayer, maxHp, xpNeededFor, insertPlayer as jsonInsertPlayer, selectPlayer as jsonSelectPlayer } from "./json-db.js";
import { loadInventory, saveInventory, upsertItem as jsonUpsertItem, selectInventory as jsonSelectInventory, consumeStmt as jsonConsumeStmt } from "./json-db.js";
import { loadGuilds, saveGuilds, GuildConfig } from "./json-db.js";
import { loadWarnings, saveWarnings, insertWarning as jsonInsertWarning } from "./json-db.js";
import { loadVoice, saveVoice } from "./json-db.js";

export const db = {
  // Players - compatibilité avec l'ancienne API (dépréciée, utiliser json-db à la place)
  // Ces fonctions sont maintenues pour la compatibilité mais redirigent vers JSON
  getPlayer,
  setPlayer,
  loadPlayers,
  savePlayers,
  maxHp,
  xpNeededFor,
  // Inventory
  loadInventory,
  saveInventory,
  // Guilds config
  loadGuilds,
  saveGuilds,
  // Warnings
  loadWarnings,
  saveWarnings,
  insertWarning: jsonInsertWarning,
  // Voice
  loadVoice,
  saveVoice,
};

// HELPER: conversion player JSON -> interface Player (pour compatibilité avec les commandes existantes)
export function playerToInterface(player: any): Player {
  return {
    guild_id: player.guild_id,
    user_id: player.user_id,
    balance: player.balance ?? 0,
    xp: player.xp ?? 0,
    level: player.level ?? 1,
    daily_streak: player.daily_streak ?? 0,
    last_daily: player.last_daily ?? 0,
    last_work: player.last_work ?? 0,
    hp: player.hp ?? 100,
    last_regen: player.last_regen ?? 0,
    last_adventure: player.last_adventure ?? 0,
    weapon: player.weapon ?? null,
    armor: player.armor ?? null,
  };
}