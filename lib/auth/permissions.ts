import { WorkspaceRole } from "../types";

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Checks if a user's role meets or exceeds the required role.
 */
export function hasMinimumRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Only workspace OWNER can manage or delete the workspace configuration.
 */
export function canManageWorkspace(role: WorkspaceRole): boolean {
  return role === "OWNER";
}

/**
 * OWNER and ADMIN can invite, remove, or modify member roles.
 */
export function canManageMembers(role: WorkspaceRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * All workspace members (OWNER, ADMIN, MEMBER) can create content.
 */
export function canCreateContent(role: WorkspaceRole): boolean {
  return Boolean(ROLE_HIERARCHY[role]);
}

/**
 * All workspace members can edit content in their workspace.
 */
export function canEditContent(role: WorkspaceRole): boolean {
  return Boolean(ROLE_HIERARCHY[role]);
}

/**
 * Content deletion permission.
 * By default, OWNER and ADMIN have administrative delete rights; MEMBERS can delete workspace content.
 */
export function canDeleteContent(role: WorkspaceRole): boolean {
  return Boolean(ROLE_HIERARCHY[role]);
}

/**
 * Verifies that an action is allowed, throwing an error if unauthorized.
 */
export function assertPermission(
  allowed: boolean,
  message = "You do not have permission to perform this action."
): void {
  if (!allowed) {
    throw new Error(message);
  }
}
