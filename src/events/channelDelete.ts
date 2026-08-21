import { ClientEvents, Events } from "discord.js";
import {
  deleteVoiceChannel,
  removeVoiceHubByChannel,
} from "../database/voice.js";

export const name = Events.ChannelDelete;

export async function execute(
  channel: ClientEvents[Events.ChannelDelete][0],
): Promise<void> {

  if (channel.id) {
    deleteVoiceChannel(channel.id);
    removeVoiceHubByChannel(channel.id);
  }
}
