import { ClientEvents, Events } from "discord.js";
import { handleVoiceStateUpdate } from "../systems/vocal.js";

export const name = Events.VoiceStateUpdate;

export async function execute(
  oldState: ClientEvents[Events.VoiceStateUpdate][0],
  newState: ClientEvents[Events.VoiceStateUpdate][1],
): Promise<void> {
  try {
    await handleVoiceStateUpdate(oldState, newState);
  } catch (error) {
    console.error("❌ Erreur dans voiceStateUpdate :", error);
  }
}
