import {
  ClientEvents,
  Events,
  type VoiceState,
} from "discord.js";
import { handleVoiceStateUpdate } from "../systems/vocal.js";

export const name = Events.VoiceStateUpdate;

export async function execute(
  oldState: ClientEvents[Events.VoiceStateUpdate][0],
  _newState: VoiceState,
): Promise<void> {
  try {
    await handleVoiceStateUpdate(oldState);
  } catch (error) {
    console.error("❌ Erreur dans voiceStateUpdate :", error);
  }
}
