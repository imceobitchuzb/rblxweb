"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import {
  Workspace,
  WorkspaceMemberDetail,
  WorkspaceRole,
  WorkspaceSummary,
} from "../../lib/types";
import {
  getWorkspaceMembers,
  getWorkspacesForUser,
  leaveWorkspace,
  removeWorkspaceMember,
  switchActiveWorkspace,
  updateMemberRole,
  updateWorkspaceDetails,
} from "../../lib/server/workspaces";
import { AuthSessionResponse } from "./auth";

/**
 * Returns all workspaces the authenticated user belongs to.
 */
export async function fetchUserWorkspacesAction(): Promise<ActionResult<WorkspaceSummary[]>> {
  try {
    const ctx = await getAuthContext();
    const workspaces = await getWorkspacesForUser(ctx.user.id, ctx.workspace.id);
    return successResult(workspaces);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load workspaces.";
    return errorResult(msg);
  }
}

/**
 * Returns all members of the active workspace with profiles and roles.
 */
export async function fetchWorkspaceMembersAction(): Promise<ActionResult<WorkspaceMemberDetail[]>> {
  try {
    const ctx = await getAuthContext();
    const members = await getWorkspaceMembers(ctx.workspace.id, ctx.user.id);
    return successResult(members);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load workspace members.";
    return errorResult(msg);
  }
}

/**
 * Updates the active workspace's name and/or slug. Only OWNER can perform this.
 */
export async function updateWorkspaceAction(data: {
  name?: string;
  slug?: string;
}): Promise<ActionResult<Workspace>> {
  try {
    const ctx = await getAuthContext();
    const updated = await updateWorkspaceDetails(ctx.workspace.id, data, ctx.user.id);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return successResult(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update workspace details.";
    return errorResult(msg);
  }
}

/**
 * Updates a member's role in the active workspace.
 */
export async function updateMemberRoleAction(
  targetUserId: string,
  newRole: WorkspaceRole
): Promise<ActionResult<WorkspaceMemberDetail>> {
  try {
    const ctx = await getAuthContext();
    const updated = await updateMemberRole(ctx.workspace.id, targetUserId, newRole, ctx.user.id);
    revalidatePath("/settings");
    return successResult(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update member role.";
    return errorResult(msg);
  }
}

/**
 * Removes a member from the active workspace.
 */
export async function removeMemberAction(targetUserId: string): Promise<ActionResult<boolean>> {
  try {
    const ctx = await getAuthContext();
    const res = await removeWorkspaceMember(ctx.workspace.id, targetUserId, ctx.user.id);
    revalidatePath("/settings");
    return successResult(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to remove workspace member.";
    return errorResult(msg);
  }
}

/**
 * The current user leaves the active workspace.
 */
export async function leaveWorkspaceAction(): Promise<ActionResult<boolean>> {
  try {
    const ctx = await getAuthContext();
    const res = await leaveWorkspace(ctx.workspace.id, ctx.user.id);
    revalidatePath("/");
    revalidatePath("/settings");
    return successResult(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to leave workspace.";
    return errorResult(msg);
  }
}

/**
 * Switches the active workspace.
 * Server verifies membership, generates a signed JWT, updates session cookie, and logs audit event.
 */
export async function switchWorkspaceAction(
  targetWorkspaceId: string
): Promise<ActionResult<AuthSessionResponse>> {
  try {
    const ctx = await getAuthContext();
    const res = await switchActiveWorkspace(targetWorkspaceId, ctx.user.id);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return successResult(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to switch workspace.";
    return errorResult(msg);
  }
}
