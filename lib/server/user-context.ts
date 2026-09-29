/**
 * User & Workspace Context Abstraction for Server Actions and Data Access
 *
 * Provides user identity and active workspace resolution.
 * Seamlessly integrates with signed JWT session cookies and provides
 * deterministic demo fallback for development & offline test runners.
 */

import { DEMO_USER_ID, DEMO_WORKSPACE_ID } from "./store";
import { getAuthContext, getCurrentUserId as getAuthUserId, getCurrentWorkspaceId as getAuthWorkspaceId } from "../auth/context";
import { Workspace } from "../types";

export { DEMO_USER_ID, DEMO_WORKSPACE_ID };
export const DEMO_USER_EMAIL = "roxie@bloxmedia.gg";
export const DEMO_USER_NAME = "Roxie Velocity";
export const DEMO_CREATOR_TAG = "ROXIE_PRO";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  creatorTag: string;
}

/**
 * Returns the current active user ID.
 * All Prisma database queries and mutations scope by this ID.
 */
export async function getCurrentUserId(): Promise<string> {
  return getAuthUserId();
}

/**
 * Returns the current active user object.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const ctx = await getAuthContext();
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
    creatorTag: ctx.user.creatorTag || DEMO_CREATOR_TAG,
  };
}

/**
 * Returns the active workspace ID.
 */
export async function getCurrentWorkspaceId(): Promise<string> {
  return getAuthWorkspaceId();
}

/**
 * Returns the active workspace record.
 */
export async function getCurrentWorkspace(): Promise<Workspace> {
  const ctx = await getAuthContext();
  return ctx.workspace;
}
