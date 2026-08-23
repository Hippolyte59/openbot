import type {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;

export interface Command {
  data: CommandData;
  execute(interaction: any): Promise<void>;
}

declare module "discord.js" {
  interface Client {
    commands: any;
  }
}

export interface BotClient extends Client {
  commands: any;
}

export function asBotClient(client: Client): BotClient {
  return client as BotClient;
}
