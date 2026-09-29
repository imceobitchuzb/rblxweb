"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "../../lib/auth/session";
import { getAuthContext } from "../../lib/auth/context";
import { validateLoginInput, validateRegisterInput } from "../../lib/server/validation";
import { ActionResult, errorResult, successResult } from "../../lib/server/types";
import { memoryStore, assertPersistentDatabase } from "../../lib/server/store";
import { AuthUser, Workspace, WorkspaceRole } from "../../lib/types";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful fallback when invoked outside Next.js request context (e.g. test runner)
  }
}

export interface AuthSessionResponse {
  user: AuthUser;
  workspace: Workspace;
  role: WorkspaceRole;
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "workspace";
}

/**
 * Registers a new user account, creates their initial personal workspace,
 * assigns them the OWNER role, and issues a secure session cookie.
 */
export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  workspaceName?: string;
}): Promise<ActionResult<AuthSessionResponse>> {
  try {
    const validation = validateRegisterInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const workspaceName = data.workspaceName?.trim() || `${name}'s Studio`;
    const passwordHash = await hashPassword(data.password);
    const slugBase = generateSlug(workspaceName);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    // 1. Try DB registration
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return errorResult("An account with this email address already exists.");
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          creatorTag: name.replace(/\s+/g, "_").toUpperCase().slice(0, 15),
        },
      });

      const newWorkspace = await prisma.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: newUser.id,
        },
      });

      const member = await prisma.workspaceMember.create({
        data: {
          workspaceId: newWorkspace.id,
          userId: newUser.id,
          role: "OWNER",
        },
      });

      const token = await createSessionToken({
        sub: newUser.id,
        email: newUser.email,
        workspaceId: newWorkspace.id,
        role: member.role as WorkspaceRole,
        name: newUser.name || undefined,
        creatorTag: newUser.creatorTag || undefined,
      });

      await setSessionCookie(token);

      const response: AuthSessionResponse = {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || name,
          creatorTag: newUser.creatorTag || undefined,
          createdAt: newUser.createdAt.toISOString(),
        },
        workspace: {
          id: newWorkspace.id,
          name: newWorkspace.name,
          slug: newWorkspace.slug,
          ownerId: newWorkspace.ownerId,
          createdAt: newWorkspace.createdAt.toISOString(),
          updatedAt: newWorkspace.updatedAt.toISOString(),
        },
        role: member.role as WorkspaceRole,
      };

      safeRevalidate("/");
      return successResult(response);
    } catch (dbErr) {
      assertPersistentDatabase("registerAction", dbErr);
      // 2. Fallback to memory store registration when DB is unreachable (dev/test only)
      const existingMemUser = memoryStore.users.find((u) => u.email === email);
      if (existingMemUser) {
        return errorResult("An account with this email address already exists.");
      }

      const now = new Date().toISOString();
      const userId = `user-${Date.now().toString(36)}`;
      const workspaceId = `workspace-${Date.now().toString(36)}`;

      const memUser = {
        id: userId,
        email,
        passwordHash,
        name,
        creatorTag: name.replace(/\s+/g, "_").toUpperCase().slice(0, 15),
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        createdAt: now,
        updatedAt: now,
      };

      const memWorkspace: Workspace = {
        id: workspaceId,
        name: workspaceName,
        slug,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      };

      const memMember = {
        id: `member-${Date.now().toString(36)}`,
        workspaceId,
        userId,
        role: "OWNER" as WorkspaceRole,
        createdAt: now,
        updatedAt: now,
      };

      memoryStore.users.push(memUser);
      memoryStore.workspaces.push(memWorkspace);
      memoryStore.workspaceMembers.push(memMember);

      const token = await createSessionToken({
        sub: memUser.id,
        email: memUser.email,
        workspaceId: memWorkspace.id,
        role: "OWNER",
        name: memUser.name,
        creatorTag: memUser.creatorTag,
      });

      await setSessionCookie(token);

      const response: AuthSessionResponse = {
        user: {
          id: memUser.id,
          email: memUser.email,
          name: memUser.name,
          creatorTag: memUser.creatorTag,
          createdAt: memUser.createdAt,
        },
        workspace: memWorkspace,
        role: "OWNER",
      };

      safeRevalidate("/");
      return successResult(response);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register account.";
    return errorResult(message);
  }
}

/**
 * Authenticates user credentials, locates their active workspace,
 * and issues a signed session cookie.
 */
export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<ActionResult<AuthSessionResponse>> {
  try {
    const validation = validateLoginInput(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]?.[0] || "Validation failed";
      return errorResult(firstError, validation.errors);
    }

    const email = data.email.trim().toLowerCase();

    // 1. Try DB Login
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: { workspace: true },
          },
          ownedWorkspaces: true,
        },
      });

      if (user && user.passwordHash) {
        const isValid = await verifyPassword(data.password, user.passwordHash);
        if (!isValid) {
          return errorResult("Invalid email or password.");
        }

        // Find primary workspace
        let workspace = user.memberships[0]?.workspace || user.ownedWorkspaces[0];
        let role: WorkspaceRole = (user.memberships[0]?.role as WorkspaceRole) || "OWNER";

        if (!workspace) {
          // If no workspace exists yet, create one
          const newWs = await prisma.workspace.create({
            data: {
              name: `${user.name || "Creator"}'s Studio`,
              slug: `${generateSlug(user.name || "studio")}-${Date.now().toString(36)}`,
              ownerId: user.id,
            },
          });
          await prisma.workspaceMember.create({
            data: {
              workspaceId: newWs.id,
              userId: user.id,
              role: "OWNER",
            },
          });
          workspace = newWs;
          role = "OWNER";
        }

        const token = await createSessionToken({
          sub: user.id,
          email: user.email,
          workspaceId: workspace.id,
          role,
          name: user.name || undefined,
          creatorTag: user.creatorTag || undefined,
        });

        await setSessionCookie(token);

        const response: AuthSessionResponse = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || "Creator",
            creatorTag: user.creatorTag || undefined,
            createdAt: user.createdAt.toISOString(),
          },
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            ownerId: workspace.ownerId,
            createdAt: workspace.createdAt.toISOString(),
            updatedAt: workspace.updatedAt.toISOString(),
          },
          role,
        };

        safeRevalidate("/");
        return successResult(response);
      }
    } catch (dbErr) {
      assertPersistentDatabase("loginAction", dbErr);
      // Database not reachable, proceed to memory store check (dev/test only)
    }

    if (process.env.NODE_ENV === "production") {
      return errorResult("Invalid email or password.");
    }

    // 2. Memory store login fallback
    const memUser = memoryStore.users.find((u) => u.email.toLowerCase() === email);
    if (!memUser) {
      return errorResult("Invalid email or password.");
    }

    const isValid = await verifyPassword(data.password, memUser.passwordHash);
    if (!isValid) {
      return errorResult("Invalid email or password.");
    }

    // Find workspace membership
    const membership = memoryStore.workspaceMembers.find((m) => m.userId === memUser.id);
    let memWorkspace = membership
      ? memoryStore.workspaces.find((w) => w.id === membership.workspaceId)
      : memoryStore.workspaces.find((w) => w.ownerId === memUser.id);

    let role: WorkspaceRole = membership?.role || "OWNER";

    if (!memWorkspace) {
      const now = new Date().toISOString();
      const wsId = `workspace-${Date.now().toString(36)}`;
      memWorkspace = {
        id: wsId,
        name: `${memUser.name}'s Studio`,
        slug: `${generateSlug(memUser.name)}-${Date.now().toString(36)}`,
        ownerId: memUser.id,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.workspaces.push(memWorkspace);
      memoryStore.workspaceMembers.push({
        id: `member-${Date.now().toString(36)}`,
        workspaceId: wsId,
        userId: memUser.id,
        role: "OWNER",
        createdAt: now,
        updatedAt: now,
      });
      role = "OWNER";
    }

    const token = await createSessionToken({
      sub: memUser.id,
      email: memUser.email,
      workspaceId: memWorkspace.id,
      role,
      name: memUser.name,
      creatorTag: memUser.creatorTag,
    });

    await setSessionCookie(token);

    const response: AuthSessionResponse = {
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        creatorTag: memUser.creatorTag,
        createdAt: memUser.createdAt,
      },
      workspace: memWorkspace,
      role,
    };

    safeRevalidate("/");
    return successResult(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign in.";
    return errorResult(message);
  }
}

/**
 * Logs out the current user by clearing the session cookie.
 */
export async function logoutAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    await clearSessionCookie();
    safeRevalidate("/");
    return successResult({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to logout.";
    return errorResult(message);
  }
}

/**
 * Retrieves the current session context.
 */
export async function getAuthSessionAction(): Promise<ActionResult<AuthSessionResponse>> {
  try {
    const ctx = await getAuthContext();
    return successResult({
      user: ctx.user,
      workspace: ctx.workspace,
      role: ctx.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve session.";
    return errorResult(message);
  }
}
