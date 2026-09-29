"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "../../lib/auth/context";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { WorkspaceInvitation, WorkspaceRole } from "../../lib/types";
import {
  acceptWorkspaceInvitation,
  createWorkspaceInvitation,
  getWorkspaceInvitations,
  revokeWorkspaceInvitation,
} from "../../lib/server/invitations";

export async function createInvitationAction(data: {
  email: string;
  role: WorkspaceRole;
}): Promise<
  ActionResult<{ invitation: WorkspaceInvitation; rawToken: string; inviteUrl: string }>
> {
  try {
    const ctx = await getAuthContext();
    const result = await createWorkspaceInvitation(
      ctx.workspace.id,
      data.email,
      data.role,
      ctx.user.id
    );
    revalidatePath("/settings");
    return successResult(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create invitation.";
    return errorResult(msg);
  }
}

export async function fetchWorkspaceInvitationsAction(): Promise<
  ActionResult<WorkspaceInvitation[]>
> {
  try {
    const ctx = await getAuthContext();
    const invites = await getWorkspaceInvitations(ctx.workspace.id, ctx.user.id);
    return successResult(invites);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load invitations.";
    return errorResult(msg);
  }
}

export async function revokeInvitationAction(
  invitationId: string
): Promise<ActionResult<boolean>> {
  try {
    const ctx = await getAuthContext();
    const ok = await revokeWorkspaceInvitation(ctx.workspace.id, invitationId, ctx.user.id);
    revalidatePath("/settings");
    return successResult(ok);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to revoke invitation.";
    return errorResult(msg);
  }
}

export async function acceptInvitationAction(
  rawToken: string
): Promise<ActionResult<{ workspaceId: string; role: WorkspaceRole }>> {
  try {
    const ctx = await getAuthContext();
    const res = await acceptWorkspaceInvitation(rawToken, ctx.user.id);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return successResult(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to accept invitation.";
    return errorResult(msg);
  }
}
