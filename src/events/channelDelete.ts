import { ClientEvents, Events } from "discord.js";
import { deleteVoiceChannel } from "../database/voice.js";

export const name = Events.ChannelDelete;

export async function execute(
  channel: ClientEvents[Events.ChannelDelete][0],
): Promise<void> {
  // Purge la table si un salon vocal géré est supprimé manuellement
  if (channel.id) {
    deleteVoiceChannel(channel.id);
  }
}
