import crypto from "crypto";
import { prisma } from "../prisma";
import { InvitationStatus, WorkspaceInvitation, WorkspaceRole } from "../types";
import { memoryStore, assertPersistentDatabase } from "./store";
import { recordAuditEvent } from "./audit";

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Creates a cryptographically secure workspace invitation.
 * Stores ONLY the SHA-256 hash of the token.
 * Returns the raw token and URL to the inviter once.
 */
export async function createWorkspaceInvitation(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  currentUserId: string,
  appUrl = "http://localhost:3000"
): Promise<{ invitation: WorkspaceInvitation; rawToken: string; inviteUrl: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email address format.");
  }

  // 1. Authorize inviter
  try {
    const inviterMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (!inviterMembership || inviterMembership.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can invite team members.");
    }

    if (inviterMembership.role === "ADMIN" && role === "OWNER") {
      throw new Error("Permission denied: Admins cannot invite someone as Owner.");
    }

    // Check if target user is already an active member of this workspace
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          where: { workspaceId },
        },
      },
    });

    if (existingUser && existingUser.memberships.length > 0) {
      throw new Error("User with this email is already a member of this workspace.");
    }

    // Check for an active pending invitation
    const existingInvite = await prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new Error("An active pending invitation already exists for this email.");
    }

    // Generate cryptographic token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const created = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email: normalizedEmail,
        role,
        status: "PENDING",
        tokenHash,
        invitedById: currentUserId,
        expiresAt,
      },
    });

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "MEMBER_INVITED",
      entityType: "INVITATION",
      entityId: created.id,
      metadata: { email: normalizedEmail, role },
    });

    const inviteResult: WorkspaceInvitation = {
      id: created.id,
      workspaceId: created.workspaceId,
      email: created.email,
      role: created.role as WorkspaceRole,
      status: created.status as InvitationStatus,
      tokenHash: created.tokenHash,
      invitedById: created.invitedById,
      expiresAt: created.expiresAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    memoryStore.invitations.push(inviteResult);

    return {
      invitation: inviteResult,
      rawToken,
      inviteUrl: `${appUrl}/invite/${rawToken}`,
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Permission denied") ||
        err.message.includes("already a member") ||
        err.message.includes("already exists") ||
        err.message.includes("Invalid email"))
    ) {
      throw err;
    }
    assertPersistentDatabase("createWorkspaceInvitation", err);

    // Memory store fallback for dev/test
    const memInviter = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memInviter || memInviter.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can invite team members.");
    }
    if (memInviter.role === "ADMIN" && role === "OWNER") {
      throw new Error("Permission denied: Admins cannot invite someone as Owner.");
    }

    // Check if user already exists and is a member
    const existingUser = memoryStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      const isMember = memoryStore.workspaceMembers.some(
        (m) => m.workspaceId === workspaceId && m.userId === existingUser.id
      );
      if (isMember) {
        throw new Error("User with this email is already a member of this workspace.");
      }
    }

    // Check pending invite in memory
    const existingPending = memoryStore.invitations.find(
      (i) =>
        i.workspaceId === workspaceId &&
        i.email.toLowerCase() === normalizedEmail &&
        i.status === "PENDING" &&
        new Date(i.expiresAt) > new Date()
    );
    if (existingPending) {
      throw new Error("An active pending invitation already exists for this email.");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const inviteResult: WorkspaceInvitation = {
      id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId,
      email: normalizedEmail,
      role,
      status: "PENDING",
      tokenHash,
      invitedById: currentUserId,
      expiresAt,
      createdAt,
      updatedAt: createdAt,
    };

    memoryStore.invitations.push(inviteResult);

    await recordAuditEvent({
      workspaceId,
      actorId: currentUserId,
      action: "MEMBER_INVITED",
      entityType: "INVITATION",
      entityId: inviteResult.id,
      metadata: { email: normalizedEmail, role },
    });

    return {
      invitation: inviteResult,
      rawToken,
      inviteUrl: `${appUrl}/invite/${rawToken}`,
    };
  }
}

/**
 * Lists all invitations for a workspace.
 * Requires OWNER or ADMIN role.
 * Lazily marks expired pending invitations.
 */
export async function getWorkspaceInvitations(
  workspaceId: string,
  currentUserId: string
): Promise<WorkspaceInvitation[]> {
  try {
    const requester = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (!requester || requester.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can view invitations.");
    }

    const invites = await prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    return invites.map((inv) => {
      let status = inv.status as InvitationStatus;
      if (status === "PENDING" && new Date(inv.expiresAt) < now) {
        status = "EXPIRED";
      }
      return {
        id: inv.id,
        workspaceId: inv.workspaceId,
        email: inv.email,
        role: inv.role as WorkspaceRole,
        status,
        tokenHash: inv.tokenHash,
        invitedById: inv.invitedById,
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
        updatedAt: inv.updatedAt.toISOString(),
      };
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Permission denied")) {
      throw err;
    }
    assertPersistentDatabase("getWorkspaceInvitations", err);

    const memRequester = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memRequester || memRequester.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can view invitations.");
    }

    const now = new Date();
    return memoryStore.invitations
      .filter((inv) => inv.workspaceId === workspaceId)
      .map((inv) => {
        if (inv.status === "PENDING" && new Date(inv.expiresAt) < now) {
          inv.status = "EXPIRED";
        }
        return { ...inv };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/**
 * Revokes an existing workspace invitation.
 * Requires OWNER or ADMIN role.
 */
export async function revokeWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
  currentUserId: string
): Promise<boolean> {
  try {
    const requester = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (!requester || requester.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can revoke invitations.");
    }

    const invite = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invite || invite.workspaceId !== workspaceId) {
      throw new Error("Invitation not found.");
    }

    if (invite.status !== "PENDING") {
      throw new Error(`Cannot revoke an invitation that is already ${invite.status.toLowerCase()}.`);
    }

    await prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: "REVOKED" },
    });

    const mem = memoryStore.invitations.find((i) => i.id === invitationId);
    if (mem) mem.status = "REVOKED";

    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Permission denied") ||
        err.message.includes("not found") ||
        err.message.includes("Cannot revoke"))
    ) {
      throw err;
    }
    assertPersistentDatabase("revokeWorkspaceInvitation", err);

    const memRequester = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === workspaceId && m.userId === currentUserId
    );
    if (!memRequester || memRequester.role === "MEMBER") {
      throw new Error("Permission denied: Only Owners and Admins can revoke invitations.");
    }

    const invite = memoryStore.invitations.find(
      (i) => i.id === invitationId && i.workspaceId === workspaceId
    );
    if (!invite) throw new Error("Invitation not found.");
    if (invite.status !== "PENDING") {
      throw new Error(`Cannot revoke an invitation that is already ${invite.status.toLowerCase()}.`);
    }

    invite.status = "REVOKED";
    return true;
  }
}

/**
 * Accepts an invitation using the raw token.
 * Adds the accepting user to the workspace with the specified role.
 */
export async function acceptWorkspaceInvitation(
  rawToken: string,
  currentUserId: string
): Promise<{ workspaceId: string; role: WorkspaceRole }> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length === 0) {
    throw new Error("Invalid or missing invitation token.");
  }

  const tokenHash = hashToken(rawToken.trim());

  try {
    const invite = await prisma.workspaceInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invite) {
      throw new Error("Invitation not found or invalid.");
    }

    if (invite.status === "REVOKED") {
      throw new Error("This invitation has been revoked.");
    }

    if (invite.status === "ACCEPTED") {
      throw new Error("This invitation has already been accepted.");
    }

    if (new Date(invite.expiresAt) < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      throw new Error("This invitation has expired.");
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId: currentUserId,
        },
      },
    });

    if (existingMembership) {
      // Mark as accepted
      await prisma.workspaceInvitation.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });
      return {
        workspaceId: invite.workspaceId,
        role: existingMembership.role as WorkspaceRole,
      };
    }

    // Create membership & mark invitation accepted
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: currentUserId,
          role: invite.role,
        },
      }),
      prisma.workspaceInvitation.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    await recordAuditEvent({
      workspaceId: invite.workspaceId,
      actorId: currentUserId,
      action: "MEMBER_JOINED",
      entityType: "MEMBER",
      entityId: currentUserId,
      metadata: { role: invite.role, invitationId: invite.id },
    });

    return {
      workspaceId: invite.workspaceId,
      role: invite.role as WorkspaceRole,
    };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Invitation not found") ||
        err.message.includes("revoked") ||
        err.message.includes("accepted") ||
        err.message.includes("expired") ||
        err.message.includes("Invalid or missing"))
    ) {
      throw err;
    }
    assertPersistentDatabase("acceptWorkspaceInvitation", err);

    // Memory store fallback
    const invite = memoryStore.invitations.find((i) => i.tokenHash === tokenHash);
    if (!invite) {
      throw new Error("Invitation not found or invalid.");
    }

    if (invite.status === "REVOKED") {
      throw new Error("This invitation has been revoked.");
    }

    if (invite.status === "ACCEPTED") {
      throw new Error("This invitation has already been accepted.");
    }

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = "EXPIRED";
      throw new Error("This invitation has expired.");
    }

    const existingMembership = memoryStore.workspaceMembers.find(
      (m) => m.workspaceId === invite.workspaceId && m.userId === currentUserId
    );

    if (existingMembership) {
      invite.status = "ACCEPTED";
      return {
        workspaceId: invite.workspaceId,
        role: existingMembership.role,
      };
    }

    memoryStore.workspaceMembers.push({
      id: `wm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: invite.workspaceId,
      userId: currentUserId,
      role: invite.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    invite.status = "ACCEPTED";

    await recordAuditEvent({
      workspaceId: invite.workspaceId,
      actorId: currentUserId,
      action: "MEMBER_JOINED",
      entityType: "MEMBER",
      entityId: currentUserId,
      metadata: { role: invite.role, invitationId: invite.id },
    });

    return {
      workspaceId: invite.workspaceId,
      role: invite.role,
    };
  }
}
