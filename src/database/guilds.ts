import { db } from "./db.js";

interface AdminRoleRow {
  role_id: string;
}

const selectRoles = db.prepare<[string], AdminRoleRow>(
  "SELECT role_id FROM admin_roles WHERE guild_id = ?",
);

const insertRole = db.prepare<[string, string]>(
  "INSERT OR IGNORE INTO admin_roles (guild_id, role_id) VALUES (?, ?)",
);

const deleteRole = db.prepare<[string, string]>(
  "DELETE FROM admin_roles WHERE guild_id = ? AND role_id = ?",
);

export function getAdminRoles(guildId: string): string[] {
  return selectRoles.all(guildId).map((row) => row.role_id);
}

export function addAdminRole(guildId: string, roleId: string): boolean {
  const result = insertRole.run(guildId, roleId);
  return result.changes > 0;
}

export function removeAdminRole(guildId: string, roleId: string): boolean {
  const result = deleteRole.run(guildId, roleId);
  return result.changes > 0;
}
