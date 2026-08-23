import * as pkg from "discord.js";
const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = pkg as any;
import type { ChatInputCommandInteraction, GuildMember, TextChannel } from "discord.js";
import type { Command } from "../types.js";
import {
  addAdminRole,
  getAdminRoles,
  removeAdminRole,
} from "../database/guilds.js";
import { clearInventory } from "../database/inventory.js";
import {
  addBalance,
  getPlayer,
  removeBalance,
  resetPlayer,
} from "../database/players.js";
import { createEmbed, errorEmbed } from "../utils/embeds.js";
import { formatNumber } from "../utils/format.js";
import { config } from "../config.js";

function hasAdminAccess(
  interaction: any,
): boolean {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  const allowedRoles = getAdminRoles(interaction.guildId!);
  const member = interaction.member as GuildMember;
  return member.roles.cache.some((role) => allowedRoles.includes(role.id));
}

export default {
  data: new (SlashCommandBuilder as any)()
    .setName("admin")
    .setDescription(
      "🛠️ Commandes d'administration (admins et rôles autorisés uniquement)",
    )
    .addSubcommandGroup((group) =>
      group
        .setName("roles")
        .setDescription("🔐 Gère les rôles autorisés à utiliser /admin")
        .addSubcommand((sub) =>
          sub
            .setName("ajouter")
            .setDescription("✅ Autorise un rôle à utiliser les commandes admin")
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Le rôle à autoriser")
                .setRequired(true),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("retirer")
            .setDescription("⛔ Retire l'accès admin d'un rôle")
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("Le rôle à retirer")
                .setRequired(true),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("liste")
            .setDescription("📋 Liste les rôles ayant accès aux commandes admin"),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName("argent")
        .setDescription("💰 Gère l'économie du serveur")
        .addSubcommand((sub) =>
          sub
            .setName("donner")
            .setDescription("➕ Crée et donne des pièces à un membre")
            .addUserOption((option) =>
              option
                .setName("membre")
                .setDescription("Le membre qui reçoit")
                .setRequired(true),
            )
            .addIntegerOption((option) =>
              option
                .setName("montant")
                .setDescription("Montant à créer")
                .setRequired(true)
                .setMinValue(1),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName("retirer")
            .setDescription("➖ Retire des pièces à un membre")
            .addUserOption((option) =>
              option
                .setName("membre")
                .setDescription("Le membre concerné")
                .setRequired(true),
            )
            .addIntegerOption((option) =>
              option
                .setName("montant")
                .setDescription("Montant à retirer")
                .setRequired(true)
                .setMinValue(1),
            ),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reinitialiser")
        .setDescription("♻️ Remet à zéro le profil complet d'un membre")
        .addUserOption((option) =>
          option
            .setName("membre")
            .setDescription("Le membre à réinitialiser")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("annoncer")
        .setDescription("📢 Publie une annonce officielle dans un salon")
        .addStringOption((option) =>
          option
            .setName("titre")
            .setDescription("Titre de l'annonce")
            .setRequired(true)
            .setMaxLength(200),
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Contenu de l'annonce")
            .setRequired(true)
            .setMaxLength(2000),
        )
        .addChannelOption((option) =>
          option
            .setName("salon")
            .setDescription(
              "Salon de publication (le salon actuel par défaut)",
            )
            .addChannelTypes(ChannelType.GuildText),
        )
        .addBooleanOption((option) =>
          option
            .setName("mention")
            .setDescription("Mentionner @everyone ? (défaut : non)"),
        ),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    if (!hasAdminAccess(interaction)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            [
              "Cette commande est réservée aux **administrateurs** et aux **rôles autorisés**.",
              "",
              "💡 Un administrateur peut accorder l'accès avec `/admin roles ajouter`.",
            ].join("\n"),
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const guildId = interaction.guildId;
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(true);

    if (group === "roles") {
      if (sub === "ajouter" || sub === "retirer") {
        const role = interaction.options.getRole("role", true);
        if (role.id === interaction.guild!.id) {
          await interaction.reply({
            embeds: [errorEmbed("Le rôle @everyone ne peut pas être géré.")],
            ephemeral: true,
          });
          return;
        }
        const changed =
          sub === "ajouter"
            ? addAdminRole(guildId, role.id)
            : removeAdminRole(guildId, role.id);

        const label =
          sub === "ajouter"
            ? `✅ Le rôle ${role} peut désormais utiliser les commandes admin.`
            : `✅ Le rôle ${role} n'a plus accès aux commandes admin.`;

        await interaction.reply({
          embeds: [createEmbed(changed ? "success" : "warning").setDescription(label)],
          ephemeral: true,
        });
        return;
      }

      const roles = getAdminRoles(guildId);
      const lines = roles.length
        ? roles.map((id) => `- <@&${id}>`).join("\n")
        : "_Aucun rôle configuré : seuls les administrateurs ont accès._";

      await interaction.reply({
        embeds: [
          createEmbed()
            .setTitle("🔐 Rôles autorisés (/admin)")
            .setDescription(lines),
        ],
        ephemeral: true,
      });
      return;
    }

    if (group === "argent") {
      const target = interaction.options.getUser("membre", true);
      const amount = interaction.options.getInteger("montant", true);

      if (target.bot || target.id === interaction.user.id) {
        await interaction.reply({
          embeds: [errorEmbed("Cible invalide (bot ou toi-même).")],
          ephemeral: true,
        });
        return;
      }

      let applied = true;
      if (sub === "donner") {
        addBalance(guildId, target.id, amount);
      } else {
        applied = removeBalance(guildId, target.id, amount);
      }

      const description =
        sub === "donner"
          ? `💰 **+${formatNumber(amount)} ${config.currency}** créés pour ${target}.`
          : applied
            ? `📉 **-${formatNumber(amount)} ${config.currency}** retirés à ${target}.`
            : `⚠️ ${target} n'avait que **${formatNumber(getPlayer(guildId, target.id).balance)} ${config.currency}** : solde ramené au maximum possible.`;

      await interaction.reply({
        embeds: [createEmbed(applied || sub === "donner" ? "success" : "warning").setDescription(description)],
        ephemeral: true,
      });
      return;
    }

    if (sub === "reinitialiser") {
      const target = interaction.options.getUser("membre", true);
      if (target.bot) {
        await interaction.reply({
          embeds: [errorEmbed("Impossible de réinitialiser un bot.")],
          ephemeral: true,
        });
        return;
      }
      resetPlayer(guildId, target.id);
      clearInventory(guildId, target.id);

      await interaction.reply({
        embeds: [
          createEmbed("success").setDescription(
            `♻️ Profil de ${target} entièrement réinitialisé (argent, XP, niveau, PV, inventaire).`,
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "annoncer") {
      const titre = interaction.options.getString("titre", true);
      const message = interaction.options.getString("message", true);
      const mention = interaction.options.getBoolean("mention") ?? false;
      const salon = (interaction.options.getChannel("salon") ??
        interaction.channel) as TextChannel | null;

      if (!salon?.isTextBased()) {
        await interaction.reply({
          embeds: [errorEmbed("Salon introuvable ou invalide.")],
          ephemeral: true,
        });
        return;
      }

      const embed = createEmbed("primary")
        .setTitle(`📢 ${titre}`)
        .setDescription(message)
        .setAuthor({
          name: `Annonce de ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      try {
        await salon.send({
          content: mention ? "@everyone" : undefined,
          embeds: [embed],
        });
        await interaction.reply({
          embeds: [
            createEmbed("success").setDescription(
              `✅ Annonce publiée dans ${salon}.`,
            ),
          ],
          ephemeral: true,
        });
      } catch {
        await interaction.reply({
          embeds: [
            errorEmbed(
              `Impossible d'envoyer dans ${salon} — vérifie mes permissions sur ce salon.`,
            ),
          ],
          ephemeral: true,
        });
      }
    }
  },
} satisfies Command;
