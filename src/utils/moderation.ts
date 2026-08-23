import * as pkg from "discord.js";
const { PermissionFlagsBits } = pkg as any;
import { getAdminRoles } from "../database/guilds.js";

export function hasModAccess(
  interaction: any,
  ...permissions: bigint[]
): boolean {
  if (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  const allowedRoles = getAdminRoles(interaction.guildId!);
  const member = interaction.member as any;
  if (member.roles.cache.some((role: any) => allowedRoles.includes(role.id))) {
    return true;
  }

  return permissions.some((permission) =>
    interaction.memberPermissions?.has(permission),
  );
}

export interface ModerationTarget {
  member: any;
  user: import("discord.js").User;
}

export function moderationError(
  interaction: any,
  targetMember: any | null,
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

  const executor = interaction.member as any;
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
