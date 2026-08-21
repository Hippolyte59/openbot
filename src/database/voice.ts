import { db } from "./db.js";

export interface VoiceChannelRow {
  channel_id: string;
  guild_id: string;
  owner_id: string;
  message_id: string | null;
}

const insertChannel = db.prepare<[string, string, string, string | null]>(
  "INSERT OR REPLACE INTO voice_channels (channel_id, guild_id, owner_id, message_id) VALUES (?, ?, ?, ?)",
);

const selectByChannel = db.prepare<[string], VoiceChannelRow>(
  "SELECT * FROM voice_channels WHERE channel_id = ?",
);

const selectByOwner = db.prepare<[string, string], VoiceChannelRow>(
  "SELECT * FROM voice_channels WHERE guild_id = ? AND owner_id = ?",
);

const deleteByChannel = db.prepare<[string]>(
  "DELETE FROM voice_channels WHERE channel_id = ?",
);

const updateMessageId = db.prepare<[string | null, string]>(
  "UPDATE voice_channels SET message_id = ? WHERE channel_id = ?",
);

const updateOwner = db.prepare<[string, string]>(
  "UPDATE voice_channels SET owner_id = ? WHERE channel_id = ?",
);

export function saveVoiceChannel(
  channelId: string,
  guildId: string,
  ownerId: string,
  messageId: string | null,
): void {
  insertChannel.run(channelId, guildId, ownerId, messageId);
}

export function getVoiceChannel(channelId: string): VoiceChannelRow | undefined {
  return selectByChannel.get(channelId);
}

export function findVoiceChannelByOwner(
  guildId: string,
  ownerId: string,
): VoiceChannelRow | undefined {
  return selectByOwner.get(guildId, ownerId);
}

export function deleteVoiceChannel(channelId: string): void {
  deleteByChannel.run(channelId);
}

export function setVoicePanelMessage(
  channelId: string,
  messageId: string | null,
): void {
  updateMessageId.run(messageId, channelId);
}

export function transferVoiceOwnership(
  channelId: string,
  newOwnerId: string,
): void {
  updateOwner.run(newOwnerId, channelId);
}

export interface VoiceHubRow {
  guild_id: string;
  channel_id: string;
}

const upsertHub = db.prepare<[string, string]>(
  "INSERT OR REPLACE INTO voice_hubs (guild_id, channel_id) VALUES (?, ?)",
);

const selectHub = db.prepare<[string], VoiceHubRow>(
  "SELECT * FROM voice_hubs WHERE guild_id = ?",
);

const deleteHubByGuild = db.prepare<[string]>(
  "DELETE FROM voice_hubs WHERE guild_id = ?",
);

const deleteHubByChannel = db.prepare<[string]>(
  "DELETE FROM voice_hubs WHERE channel_id = ?",
);

export function setVoiceHub(guildId: string, channelId: string): void {
  upsertHub.run(guildId, channelId);
}

export function getVoiceHub(guildId: string): VoiceHubRow | undefined {
  return selectHub.get(guildId);
}

export function removeVoiceHubByGuild(guildId: string): void {
  deleteHubByGuild.run(guildId);
}

export function removeVoiceHubByChannel(channelId: string): void {
  deleteHubByChannel.run(channelId);
}
