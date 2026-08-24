import { Events, type Interaction } from "discord.js";
import { asBotClient } from "../types.js";
import { errorEmbed } from "../utils/embeds.js";
import {
  handleVocalButton,
  handleVocalModal,
} from "../systems/vocal.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: any): Promise<void> {

  if (interaction.isButton()) {
    try {
      const consumed = await handleVocalButton(interaction);
      if (consumed) return;
    } catch (error) {
      console.error("❌ Erreur dans un bouton du panneau vocal :", error);
    }
    // Demo / ticket / suggestion
    try {
      const id = interaction.customId as string;
      if (id.startsWith("demo:")) {
        if (id === "demo:ok") await interaction.reply({ content: "Valide !", ephemeral:true });
        else if (id === "demo:cancel") await interaction.reply({ content: "Annule.", ephemeral:true });
        else if (id === "demo:info") await interaction.reply({ content: "Demo boutons et selecteur — utilise /demo select pour le menu.", ephemeral:true });
        else await interaction.reply({ content: `Bouton ${id}`, ephemeral:true });
        return;
      }
      if (id === "ticket:create") {
        const cmd = (await import("../commands/ticket.js")).default;
        // Simulate creating via command logic would need interaction type, just acknowledge
        await interaction.reply({ content: "Utilise /ticket creer <sujet> pour ouvrir un ticket.", ephemeral:true });
        return;
      }
      if (id.startsWith("sugg:")) {
        const [, dir, fullId] = id.split(":");
        const { loadSuggestions, saveSuggestions } = await import("../database/json-db.js");
        const store = loadSuggestions();
        const s = store.get(fullId);
        if (!s) { await interaction.reply({ content:"Suggestion introuvable.", ephemeral:true}); return; }
        const prev = s.voters[interaction.user.id];
        if (prev === dir) { await interaction.reply({ content:"Tu as deja vote.", ephemeral:true}); return; }
        if (prev === "up") s.up--; if (prev === "down") s.down--;
        if (dir === "up") s.up++; else s.down++;
        s.voters[interaction.user.id]=dir as any;
        store.set(fullId, s); saveSuggestions(store);
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import("discord.js") as any;
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`sugg:up:${fullId}`).setLabel(`Pour ${s.up}`).setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`sugg:down:${fullId}`).setLabel(`Contre ${s.down}`).setStyle(ButtonStyle.Danger),
        );
        await interaction.update({ components:[row] });
        return;
      }
    } catch (e) { console.error("interaction button", e); }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "demo:select") {
      const val = interaction.values[0];
      await interaction.reply({ content: `Tu as choisi : ${val}`, ephemeral:true });
      return;
    }
  }

  if (interaction.isAutocomplete()) {
    try {
      if (interaction.commandName === "message") {
        const focused = interaction.options.getFocused(true);
        if (focused.name === "nom") {
          const { loadSaved } = await import("../database/json-db.js");
          const list = [...loadSaved().values()].filter(m=>m.guildId===interaction.guildId).map(m=>m.name).filter(n=>n.includes(String(focused.value).toLowerCase())).slice(0,25);
          await interaction.respond(list.map(n=>({name:n, value:n})));
          return;
        }
      }
    } catch {}
    return;
  }

  if (interaction.isModalSubmit()) {
    try {
      await handleVocalModal(interaction);
    } catch (error) {
      console.error("❌ Erreur dans une modale :", error);
      const payload = {
        embeds: [errorEmbed("Une erreur est survenue.")],
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = asBotClient(interaction.client).commands.get(
    interaction.commandName,
  );
  if (!command) {
    console.warn(`⚠️  Commande inconnue reçue : /${interaction.commandName}`);
    return;
  }

  if (!interaction.inGuild()) {
    await (interaction as any).reply({
      embeds: [errorEmbed("Cette commande doit être utilisée dans un serveur.")],
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erreur dans /${interaction.commandName} :`, error);

    const payload = {
      embeds: [
        errorEmbed("Une erreur est survenue en exécutant cette commande."),
      ],
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
}
