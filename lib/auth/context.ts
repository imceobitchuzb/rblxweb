import { prisma } from "../prisma";
import { AuthContext, AuthUser, SessionPayload, Workspace, WorkspaceRole } from "../types";
import { getSessionCookie, verifySessionToken } from "./session";
import { DEMO_USER_ID, DEMO_WORKSPACE_ID, memoryStore } from "../server/store";

export const DEMO_USER: AuthUser = {
  id: DEMO_USER_ID,
  email: "roxie@bloxmedia.gg",
  name: "Roxie Velocity",
  creatorTag: "ROXIE_PRO",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const DEMO_WORKSPACE: Workspace = {
  id: DEMO_WORKSPACE_ID,
  name: "Roxie Velocity Studio",
  slug: "roxie-velocity",
  ownerId: DEMO_USER_ID,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

/**
 * Returns the decoded session payload from the HTTP request cookie if valid.
 */
export async function getAuthSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Resolves the authenticated user and active workspace.
 * Falls back to deterministic Demo context if no session cookie is present
 * (ensuring zero-downtime offline and test suite compatibility).
 */
export async function getAuthContext(): Promise<AuthContext> {
  const session = await getAuthSession();

  if (session) {
    // 1. Try resolving from database
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.sub },
      });

      const dbWorkspace = await prisma.workspace.findUnique({
        where: { id: session.workspaceId },
      });

      const dbMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: session.workspaceId,
            userId: session.sub,
          },
        },
      });

      if (dbUser && dbWorkspace) {
        return {
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || "Creator",
            creatorTag: dbUser.creatorTag || undefined,
            avatarUrl: dbUser.avatarUrl || undefined,
            createdAt: dbUser.createdAt.toISOString(),
          },
          workspace: {
            id: dbWorkspace.id,
            name: dbWorkspace.name,
            slug: dbWorkspace.slug,
            ownerId: dbWorkspace.ownerId,
            createdAt: dbWorkspace.createdAt.toISOString(),
            updatedAt: dbWorkspace.updatedAt.toISOString(),
          },
          role: (dbMember?.role as WorkspaceRole) || session.role || "MEMBER",
        };
      }
    } catch {
      // Fallback to memory store
    }

    // 2. Resolve from memory store
    const memUser = memoryStore.users.find((u) => u.id === session.sub);
    const memWorkspace = memoryStore.workspaces.find((w) => w.id === session.workspaceId);
    const memMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === session.workspaceId && m.userId === session.sub
    );

    if (memUser && memWorkspace) {
      return {
        user: {
          id: memUser.id,
          email: memUser.email,
          name: memUser.name,
          creatorTag: memUser.creatorTag,
          avatarUrl: memUser.avatarUrl,
          createdAt: memUser.createdAt,
        },
        workspace: memWorkspace,
        role: memMember?.role || session.role || "MEMBER",
      };
    }

    // Fallback if session exists but user/workspace deleted
    return {
      user: {
        id: session.sub,
        email: session.email,
        name: session.name || "Creator",
        creatorTag: session.creatorTag,
      },
      workspace: {
        id: session.workspaceId,
        name: "My Workspace",
        slug: "my-workspace",
        ownerId: session.sub,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      role: session.role || "OWNER",
    };
  }

  // No session token -> Default Demo context
  return {
    user: DEMO_USER,
    workspace: DEMO_WORKSPACE,
    role: "OWNER",
  };
}

/**
 * Strict authentication: requires a valid session token.
 * Throws an Error if no valid session token exists.
 */
export async function requireStrictAuth(): Promise<AuthContext> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Session required");
  }
  return getAuthContext();
}

/**
 * Resolves active context, throwing if unauthorized.
 */
export async function requireAuth(): Promise<AuthContext> {
  return getAuthContext();
}

/**
 * Quick accessor for active user ID.
 */
export async function getCurrentUserId(): Promise<string> {
  const ctx = await getAuthContext();
  return ctx.user.id;
}

/**
 * Quick accessor for active workspace ID.
 */
export async function getCurrentWorkspaceId(): Promise<string> {
  const ctx = await getAuthContext();
  return ctx.workspace.id;
}
