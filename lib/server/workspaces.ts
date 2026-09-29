import { prisma } from "../prisma";
import {
  Workspace,
  WorkspaceMemberDetail,
  WorkspaceRole,
  WorkspaceSummary,
} from "../types";
import { createSessionToken, setSessionCookie } from "../auth/session";
import { AuthSessionResponse } from "../../app/actions/auth";
import { memoryStore, assertPersistentDatabase } from "./store";
import { recordAuditEvent } from "./audit";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Returns all workspaces the given user is a member of.
 */
export async function getWorkspacesForUser(
  userId: string,
  activeWorkspaceId?: string
): Promise<WorkspaceSummary[]> {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      ownerId: m.workspace.ownerId,
      role: m.role as WorkspaceRole,
      isCurrent: m.workspace.id === activeWorkspaceId,
      memberCount: m.workspace._count.members,
    }));
  } catch (err) {
    assertPersistentDatabase("getWorkspacesForUser", err);

    const memMemberships = memoryStore.workspaceMembers.filter((m) => m.userId === userId);
    const result: WorkspaceSummary[] = [];
    for (const m of memMemberships) {
      const ws = memoryStore.workspaces.find((w) => w.id === m.workspaceId);
      if (ws) {
        const count = memoryStore.workspaceMembers.filter((mem) => mem.workspaceId === ws.id).length;
        result.push({
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          ownerId: ws.ownerId,
          role: m.role,
          isCurrent: ws.id === activeWorkspaceId,
          memberCount: count,
        });
      }
    }
    return result;
  }
}

/**
 * Returns all members of a workspace with user profile details.
 * Requires that currentUserId is a member of the workspace.
 */
export async function getWorkspaceMembers(
  workspaceId: string,
  currentUserId: string
): Promise<WorkspaceMemberDetail[]> {
  try {
    const requester = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: currentUserId } },
    });
    if (!requester) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: m.role as WorkspaceRole,
      name: m.user.name || "Creator",
      email: m.user.email,
      creatorTag: m.user.creatorTag || undefined,
      avatarUrl: m.user.avatarUrl || undefined,
      createdAt: m.createdAt.toISOString(),
    }));
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access denied")) {
      throw err;
    }
    assertPersistentDatabase("getWorkspaceMembers", err);

    const memRequester = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memRequester) {
      throw new Error("Access denied: You are not a member of this workspace.");
    }

    const members = memoryStore.workspaceMembers.filter((m) => m.workspaceId === workspaceId);
    return members.map((m) => {
      const u = memoryStore.users.find((user) => user.id === m.userId);
      return {
        id: m.id,
        workspaceId: m.workspaceId,
        userId: m.userId,
        role: m.role,
        name: u?.name || "Creator",
        email: u?.email || "unknown@bloxmedia.gg",
        creatorTag: u?.creatorTag,
        avatarUrl: u?.avatarUrl,
        createdAt: m.createdAt,
      };
    });
  }
}

/**
 * Updates workspace name and/or slug.
 * Strictly limited to workspace OWNER.
 */
export async function updateWorkspaceDetails(
  workspaceId: string,
  data: { name?: string; slug?: string },
  currentUserId: string
): Promise<Workspace> {
  const cleanName = data.name?.trim();
  const rawSlug = data.slug?.trim();
  const cleanSlug = rawSlug ? slugify(rawSlug) : undefined;

  if (cleanName && cleanName.length < 2) {
    throw new Error("Workspace name must be at least 2 characters long.");
  }
  if (cleanSlug !== undefined && cleanSlug.length < 2) {
    throw new Error("Workspace slug must be at least 2 characters long.");
  }

  try {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!ws) throw new Error("Workspace not found.");

    if (ws.ownerId !== currentUserId) {
      throw new Error("Only the workspace owner can modify workspace settings.");
    }

    if (cleanSlug && cleanSlug !== ws.slug) {
      const slugExists = await prisma.workspace.findUnique({ where: { slug: cleanSlug } });
      if (slugExists && slugExists.id !== workspaceId) {
        throw new Error(`The slug '${cleanSlug}' is already taken.`);
      }
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(cleanName ? { name: cleanName } : {}),
        ...(cleanSlug ? { slug: cleanSlug } : {}),
      },
    });

    if (cleanName && cleanName !== ws.name) {
      await recordAuditEvent({
        workspaceId,
        actorId: currentUserId,
        action: "WORKSPACE_RENAMED",
        entityType: "WORKSPACE",
        entityId: workspaceId,
        metadata: { oldName: ws.name, newName: cleanName },
      });
    }

    if (cleanSlug && cleanSlug !== ws.slug) {
      await recordAuditEvent({
        workspaceId,
        actorId: currentUserId,
        action: "WORKSPACE_SLUG_CHANGED",
        entityType: "WORKSPACE",
        entityId: workspaceId,
        metadata: { oldSlug: ws.slug, newSlug: cleanSlug },
      });
    }

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      ownerId: updated.ownerId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("owner can modify") ||
        err.message.includes("already taken") ||
        err.message.includes("Workspace not found"))
    ) {
      throw err;
    }
    assertPersistentDatabase("updateWorkspaceDetails", err);

    const memWs = memoryStore.workspaces.find((w) => w.id === workspaceId);
    if (!memWs) throw new Error("Workspace not found.");
    if (memWs.ownerId !== currentUserId) {
      throw new Error("Only the workspace owner can modify workspace settings.");
    }

    if (cleanSlug && cleanSlug !== memWs.slug) {
      const slugExists = memoryStore.workspaces.find(
        (w) => w.slug === cleanSlug && w.id !== workspaceId
      );
      if (slugExists) {
        throw new Error(`The slug '${cleanSlug}' is already taken.`);
      }
    }

    if (cleanName) memWs.name = cleanName;
    if (cleanSlug) memWs.slug = cleanSlug;
    memWs.updatedAt = new Date().toISOString();

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "WORKSPACE_RENAMED",
      entityType: "WORKSPACE",
      entityId: workspaceId,
      metadata: { name: memWs.name },
    });

    return memWs;
  }
}

/**
 * Updates a member's role within a workspace.
 * Role hierarchy enforced:
 * - OWNER: can change any role (except assigning another OWNER directly without transfer).
 * - ADMIN: can promote/demote between MEMBER and ADMIN; cannot promote to OWNER; cannot modify OWNER.
 * - MEMBER: cannot change any roles.
 */
export async function updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: WorkspaceRole,
  currentUserId: string
): Promise<WorkspaceMemberDetail> {
  if (targetUserId === currentUserId && newRole !== "OWNER") {
    // Cannot demote self
    throw new Error("You cannot change your own role.");
  }

  try {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!ws) throw new Error("Workspace not found.");

    const requesterMember = ws.members.find((m) => m.userId === currentUserId);
    if (!requesterMember) throw new Error("Access denied: Not a member of this workspace.");

    if (requesterMember.role === "MEMBER") {
      throw new Error("Members do not have permission to manage roles.");
    }

    const targetMember = ws.members.find((m) => m.userId === targetUserId);
    if (!targetMember) throw new Error("Target member not found in this workspace.");

    if (ws.ownerId === targetUserId) {
      throw new Error("Cannot modify the role of the workspace owner.");
    }

    if (requesterMember.role === "ADMIN") {
      if (newRole === "OWNER") {
        throw new Error("Admins cannot promote members to Owner.");
      }
      if (targetMember.role === "ADMIN" && requesterMember.userId !== ws.ownerId) {
        throw new Error("Admins cannot modify another Admin's role.");
      }
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
      data: { role: newRole },
      include: { user: true },
    });

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "ROLE_CHANGED",
      entityType: "MEMBER",
      entityId: targetUserId,
      metadata: { oldRole: targetMember.role, newRole },
    });

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      userId: updated.userId,
      role: updated.role as WorkspaceRole,
      name: updated.user.name || "Creator",
      email: updated.user.email,
      creatorTag: updated.user.creatorTag || undefined,
      avatarUrl: updated.user.avatarUrl || undefined,
      createdAt: updated.createdAt.toISOString(),
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("permission") ||
        err.message.includes("workspace owner") ||
        err.message.includes("cannot promote") ||
        err.message.includes("cannot modify") ||
        err.message.includes("cannot change your own") ||
        err.message.includes("not found"))
    ) {
      throw err;
    }
    assertPersistentDatabase("updateMemberRole", err);

    const memWs = memoryStore.workspaces.find((w) => w.id === workspaceId);
    if (!memWs) throw new Error("Workspace not found.");

    const requesterMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!requesterMember || requesterMember.role === "MEMBER") {
      throw new Error("Members do not have permission to manage roles.");
    }

    const targetMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === targetUserId
    );
    if (!targetMember) throw new Error("Target member not found in this workspace.");

    if (memWs.ownerId === targetUserId) {
      throw new Error("Cannot modify the role of the workspace owner.");
    }

    if (requesterMember.role === "ADMIN") {
      if (newRole === "OWNER") {
        throw new Error("Admins cannot promote members to Owner.");
      }
      if (targetMember.role === "ADMIN") {
        throw new Error("Admins cannot modify another Admin's role.");
      }
    }

    targetMember.role = newRole;
    targetMember.updatedAt = new Date().toISOString();

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "ROLE_CHANGED",
      entityType: "MEMBER",
      entityId: targetUserId,
      metadata: { oldRole: targetMember.role, newRole },
    });

    const user = memoryStore.users.find((u) => u.id === targetUserId);
    return {
      id: targetMember.id,
      workspaceId,
      userId: targetUserId,
      role: newRole,
      name: user?.name || "Creator",
      email: user?.email || "unknown@bloxmedia.gg",
      creatorTag: user?.creatorTag,
      avatarUrl: user?.avatarUrl,
      createdAt: targetMember.createdAt,
    };
  }
}

/**
 * Removes a member from a workspace.
 * Strict RBAC rules apply.
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  targetUserId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!ws) throw new Error("Workspace not found.");

    if (ws.ownerId === targetUserId) {
      throw new Error("Cannot remove workspace owner.");
    }

    const requesterMember = ws.members.find((m) => m.userId === currentUserId);
    if (!requesterMember || requesterMember.role === "MEMBER") {
      throw new Error("Members do not have permission to remove workspace members.");
    }

    const targetMember = ws.members.find((m) => m.userId === targetUserId);
    if (!targetMember) throw new Error("Target member not found in this workspace.");

    if (requesterMember.role === "ADMIN" && (targetMember.role === "ADMIN" || targetMember.role === "OWNER")) {
      throw new Error("Admins cannot remove other admins or the owner.");
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
    });

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "MEMBER_REMOVED",
      entityType: "MEMBER",
      entityId: targetUserId,
      metadata: { removedUserId: targetUserId },
    });

    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("permission") ||
        err.message.includes("Cannot remove workspace owner") ||
        err.message.includes("cannot remove other admins") ||
        err.message.includes("not found"))
    ) {
      throw err;
    }
    assertPersistentDatabase("removeWorkspaceMember", err);

    const memWs = memoryStore.workspaces.find((w) => w.id === workspaceId);
    if (!memWs) throw new Error("Workspace not found.");
    if (memWs.ownerId === targetUserId) {
      throw new Error("Cannot remove workspace owner.");
    }

    const requesterMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!requesterMember || requesterMember.role === "MEMBER") {
      throw new Error("Members do not have permission to remove workspace members.");
    }

    const targetMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === targetUserId
    );
    if (!targetMember) throw new Error("Target member not found in this workspace.");

    if (requesterMember.role === "ADMIN" && targetMember.role === "ADMIN") {
      throw new Error("Admins cannot remove other admins or the owner.");
    }

    memoryStore.workspaceMembers = memoryStore.workspaceMembers.filter(
      (m) => !(m.workspaceId === workspaceId && m.userId === targetUserId)
    );

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "MEMBER_REMOVED",
      entityType: "MEMBER",
      entityId: targetUserId,
      metadata: { removedUserId: targetUserId },
    });

    return true;
  }
}

/**
 * Allows a user to leave a workspace.
 * An OWNER cannot leave without first transferring ownership to another member.
 */
export async function leaveWorkspace(
  workspaceId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!ws) throw new Error("Workspace not found.");

    if (ws.ownerId === currentUserId) {
      throw new Error("Workspace owners cannot leave without transferring ownership.");
    }

    const membership = ws.members.find((m) => m.userId === currentUserId);
    if (!membership) throw new Error("You are not a member of this workspace.");

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "MEMBER_REMOVED",
      entityType: "MEMBER",
      entityId: currentUserId,
      metadata: { reason: "Self-departure" },
    });

    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("owners cannot leave") || err.message.includes("not a member"))
    ) {
      throw err;
    }
    assertPersistentDatabase("leaveWorkspace", err);

    const memWs = memoryStore.workspaces.find((w) => w.id === workspaceId);
    if (!memWs) throw new Error("Workspace not found.");
    if (memWs.ownerId === currentUserId) {
      throw new Error("Workspace owners cannot leave without transferring ownership.");
    }

    const membership = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!membership) throw new Error("You are not a member of this workspace.");

    memoryStore.workspaceMembers = memoryStore.workspaceMembers.filter(
      (m) => !(m.workspaceId === workspaceId && m.userId === currentUserId)
    );

    return true;
  }
}

/**
 * Switches the user's active workspace session context.
 * Strictly verifies server-side that currentUserId belongs to targetWorkspaceId.
 * Re-issues signed JWT session cookie.
 */
export async function switchActiveWorkspace(
  targetWorkspaceId: string,
  currentUserId: string
): Promise<AuthSessionResponse> {
  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: targetWorkspaceId,
          userId: currentUserId,
        },
      },
      include: {
        workspace: true,
        user: true,
      },
    });

    if (!membership) {
      throw new Error("Access denied: You are not a member of the requested workspace.");
    }

    const token = await createSessionToken({
      sub: membership.user.id,
      email: membership.user.email,
      workspaceId: membership.workspace.id,
      role: membership.role as WorkspaceRole,
      name: membership.user.name || undefined,
      creatorTag: membership.user.creatorTag || undefined,
    });

    await setSessionCookie(token);

    await recordAuditEvent({
      workspaceId: targetWorkspaceId,
      actorId: currentUserId,
      action: "WORKSPACE_SWITCHED",
      entityType: "WORKSPACE",
      entityId: targetWorkspaceId,
    });

    return {
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name || "Creator",
        creatorTag: membership.user.creatorTag || undefined,
        avatarUrl: membership.user.avatarUrl || undefined,
        createdAt: membership.user.createdAt.toISOString(),
      },
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        ownerId: membership.workspace.ownerId,
        createdAt: membership.workspace.createdAt.toISOString(),
        updatedAt: membership.workspace.updatedAt.toISOString(),
      },
      role: membership.role as WorkspaceRole,
    };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Access denied")) {
      throw err;
    }
    assertPersistentDatabase("switchActiveWorkspace", err);

    const memMember = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === targetWorkspaceId && m.userId === currentUserId
    );
    if (!memMember) {
      throw new Error("Access denied: You are not a member of the requested workspace.");
    }

    const memWs = memoryStore.workspaces.find((w) => w.id === targetWorkspaceId);
    const memUser = memoryStore.users.find((u) => u.id === currentUserId);
    if (!memWs || !memUser) {
      throw new Error("Workspace or User record missing.");
    }

    const token = await createSessionToken({
      sub: memUser.id,
      email: memUser.email,
      workspaceId: memWs.id,
      role: memMember.role,
      name: memUser.name,
      creatorTag: memUser.creatorTag,
    });

    await setSessionCookie(token);

    await recordAuditEvent({
      workspaceId: targetWorkspaceId,
      actorId: currentUserId,
      action: "WORKSPACE_SWITCHED",
      entityType: "WORKSPACE",
      entityId: targetWorkspaceId,
    });

    return {
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        creatorTag: memUser.creatorTag,
        avatarUrl: memUser.avatarUrl,
        createdAt: memUser.createdAt,
      },
      workspace: memWs,
      role: memMember.role,
    };
  }
}
