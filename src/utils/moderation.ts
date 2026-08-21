import {
  PermissionFlagsBits,
  type GuildMember,
  type ChatInputCommandInteraction,
} from "discord.js";
import { getAdminRoles } from "../database/guilds.js";

/**
 * Accès autorisé si le membre est administrateur du serveur,
 * s'il possède un rôle enregistré via /admin roles ajouter,
 * ou s'il dispose d'une des permissions Discord fournies.
 */
export function hasModAccess(
  interaction: ChatInputCommandInteraction,
  ...permissions: bigint[]
): boolean {
  if (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  const allowedRoles = getAdminRoles(interaction.guildId!);
  const member = interaction.member as GuildMember;
  if (member.roles.cache.some((role) => allowedRoles.includes(role.id))) {
    return true;
  }

  return permissions.some((permission) =>
    interaction.memberPermissions?.has(permission),
  );
}

export interface ModerationTarget {
  member: GuildMember;
  user: import("discord.js").User;
}

/**
 * Vérifications de sécurité communes aux commandes de modération.
 * @returns un message d'erreur, ou null si tout est bon.
 */
export function moderationError(
  interaction: ChatInputCommandInteraction,
  targetMember: GuildMember | null,
): string | null {
  if (!targetMember) return "Membre introuvable sur ce serveur.";
  if (targetMember.id === interaction.user.id) {
    return "Tu ne peux pas te modérer toi-même.";
  }
  if (targetMember.id === interaction.client.user.id) {
    return "Je ne vais pas me modérer moi-même !";
  }
  if (targetMember.id === interaction.guild!.ownerId) {
    return "Impossible de modérer le propriétaire du serveur.";
  }

  const executor = interaction.member as GuildMember;
  if (
    executor.id !== interaction.guild!.ownerId &&
    targetMember.roles.highest.comparePositionTo(
      executor.roles.highest,
    ) >= 0
  ) {
    return "Ce membre a un rôle égal ou supérieur au tien.";
  }

  return null;
}
