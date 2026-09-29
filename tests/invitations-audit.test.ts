import { describe, it } from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { memoryStore } from "../lib/server/store";
import {
  createWorkspaceInvitation,
  getWorkspaceInvitations,
  revokeWorkspaceInvitation,
  acceptWorkspaceInvitation,
} from "../lib/server/invitations";
import { recordAuditEvent, getWorkspaceAuditLogs } from "../lib/server/audit";
import { getWorkspaceDashboardMetrics } from "../lib/server/dashboard";
import { searchWorkspaceEntities } from "../lib/server/search";

describe("Phase 8 - Workspace Invitations, Audit Logging & Scoped Search", () => {
  const wsId = "ws-inv-test-hub";
  const otherWsId = "ws-inv-test-other";

  const ownerId = "user-inv-owner";
  const adminId = "user-inv-admin";
  const memberId = "user-inv-member";
  const outsiderId = "user-inv-outsider";

  // Setup test users
  if (!memoryStore.users.some((u) => u.id === ownerId)) {
    memoryStore.users.push(
      {
        id: ownerId,
        email: "owner@invstudio.gg",
        passwordHash: "hash",
        name: "Inv Owner",
        creatorTag: "OWNER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "",
        timezone: "UTC",
      },
      {
        id: adminId,
        email: "admin@invstudio.gg",
        passwordHash: "hash",
        name: "Inv Admin",
        creatorTag: "ADMIN_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "",
        timezone: "UTC",
      },
      {
        id: memberId,
        email: "member@invstudio.gg",
        passwordHash: "hash",
        name: "Inv Member",
        creatorTag: "MEMBER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "",
        timezone: "UTC",
      },
      {
        id: outsiderId,
        email: "outsider@invstudio.gg",
        passwordHash: "hash",
        name: "Inv Outsider",
        creatorTag: "OUTSIDER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "",
        timezone: "UTC",
      }
    );
  }

  // Setup test workspaces
  if (!memoryStore.workspaces.some((w) => w.id === wsId)) {
    memoryStore.workspaces.push(
      {
        id: wsId,
        name: "Invitation Test Hub",
        slug: "invitation-test-hub",
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: otherWsId,
        name: "Other Scoped Hub",
        slug: "other-scoped-hub",
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  // Setup memberships
  memoryStore.workspaceMembers.push(
    {
      id: "wm-inv-1",
      workspaceId: wsId,
      userId: ownerId,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-inv-2",
      workspaceId: wsId,
      userId: adminId,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-inv-3",
      workspaceId: wsId,
      userId: memberId,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-inv-other-owner",
      workspaceId: otherWsId,
      userId: ownerId,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  let validRawToken = "";
  let validInviteId = "";

  it("Invitations - 1. Cryptographically secure invitation creation and token hash storage", async () => {
    const inviteEmail = "collaborator@robloxcreator.gg";
    const res = await createWorkspaceInvitation(
      wsId,
      inviteEmail,
      "MEMBER",
      ownerId
    );

    assert.ok(res.rawToken);
    assert.strictEqual(res.rawToken.length, 64); // 32 bytes hex = 64 characters
    assert.ok(res.inviteUrl.includes(res.rawToken));

    // Verify raw token is NOT stored anywhere in the invitation record
    assert.notStrictEqual(res.invitation.tokenHash, res.rawToken);
    const expectedHash = crypto.createHash("sha256").update(res.rawToken).digest("hex");
    assert.strictEqual(res.invitation.tokenHash, expectedHash);
    assert.strictEqual(res.invitation.status, "PENDING");
    assert.strictEqual(res.invitation.email, inviteEmail);

    validRawToken = res.rawToken;
    validInviteId = res.invitation.id;

    // Verify MEMBER_INVITED audit log sanitized (no tokens or hashes in metadata)
    const lastAudit = memoryStore.auditLogs[0];
    assert.strictEqual(lastAudit.action, "MEMBER_INVITED");
    assert.strictEqual(lastAudit.metadata?.email, inviteEmail);
    assert.strictEqual(lastAudit.metadata?.token, undefined);
    assert.strictEqual(lastAudit.metadata?.tokenHash, undefined);
  });

  it("Invitations - 2. Validation prevents invalid emails, duplicates, and existing members", async () => {
    // 1. Invalid email
    await assert.rejects(
      async () => {
        await createWorkspaceInvitation(wsId, "not-an-email", "MEMBER", ownerId);
      },
      { message: /Invalid email address format/ }
    );

    // 2. Duplicate active invitation for same email
    await assert.rejects(
      async () => {
        await createWorkspaceInvitation(wsId, "collaborator@robloxcreator.gg", "MEMBER", ownerId);
      },
      { message: /An active pending invitation already exists/ }
    );

    // 3. User already a member
    await assert.rejects(
      async () => {
        await createWorkspaceInvitation(wsId, "member@invstudio.gg", "MEMBER", ownerId);
      },
      { message: /already a member of this workspace/ }
    );
  });

  it("Invitations - 3. RBAC constraints prevent MEMBER inviting and ADMIN escalating to OWNER", async () => {
    // MEMBER attempt
    await assert.rejects(
      async () => {
        await createWorkspaceInvitation(wsId, "newbie@roblox.gg", "MEMBER", memberId);
      },
      { message: /Only Owners and Admins can invite team members/ }
    );

    // ADMIN attempt to invite as OWNER
    await assert.rejects(
      async () => {
        await createWorkspaceInvitation(wsId, "boss@roblox.gg", "OWNER", adminId);
      },
      { message: /Admins cannot invite someone as Owner/ }
    );

    // ADMIN inviting as MEMBER succeeds
    const adminInvite = await createWorkspaceInvitation(wsId, "editor@roblox.gg", "MEMBER", adminId);
    assert.strictEqual(adminInvite.invitation.role, "MEMBER");
    assert.strictEqual(adminInvite.invitation.invitedById, adminId);
  });

  it("Invitations - 4. getWorkspaceInvitations authorizes admins and identifies expired invites", async () => {
    // MEMBER access rejected
    await assert.rejects(
      async () => {
        await getWorkspaceInvitations(wsId, memberId);
      },
      { message: /Only Owners and Admins can view invitations/ }
    );

    // Create an expired invitation directly in store
    const expiredToken = crypto.randomBytes(32).toString("hex");
    const expiredHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
    memoryStore.invitations.push({
      id: "inv-expired-test",
      workspaceId: wsId,
      email: "old@roblox.gg",
      role: "MEMBER",
      status: "PENDING",
      tokenHash: expiredHash,
      invitedById: ownerId,
      expiresAt: new Date(Date.now() - 10000).toISOString(), // in the past
      createdAt: new Date(Date.now() - 20000).toISOString(),
      updatedAt: new Date(Date.now() - 20000).toISOString(),
    });

    const list = await getWorkspaceInvitations(wsId, adminId);
    assert.ok(list.length >= 2);

    const expired = list.find((i) => i.id === "inv-expired-test");
    assert.ok(expired);
    assert.strictEqual(expired.status, "EXPIRED");
  });

  it("Invitations - 5. revokeWorkspaceInvitation allows ADMIN/OWNER to revoke pending invites", async () => {
    // Create an invite to revoke
    const toRevoke = await createWorkspaceInvitation(wsId, "revoke-me@roblox.gg", "MEMBER", ownerId);

    // MEMBER cannot revoke
    await assert.rejects(
      async () => {
        await revokeWorkspaceInvitation(wsId, toRevoke.invitation.id, memberId);
      },
      { message: /Only Owners and Admins can revoke invitations/ }
    );

    // ADMIN revokes
    const ok = await revokeWorkspaceInvitation(wsId, toRevoke.invitation.id, adminId);
    assert.strictEqual(ok, true);

    const updated = memoryStore.invitations.find((i) => i.id === toRevoke.invitation.id);
    assert.strictEqual(updated?.status, "REVOKED");

    // Cannot revoke already revoked invite
    await assert.rejects(
      async () => {
        await revokeWorkspaceInvitation(wsId, toRevoke.invitation.id, adminId);
      },
      { message: /Cannot revoke an invitation that is already revoked/ }
    );
  });

  it("Invitations - 6. acceptWorkspaceInvitation successfully adds member and updates status", async () => {
    // Accept valid invitation created in test 1 with outsiderId
    const res = await acceptWorkspaceInvitation(validRawToken, outsiderId);
    assert.strictEqual(res.workspaceId, wsId);
    assert.strictEqual(res.role, "MEMBER");

    // Check invitation marked as ACCEPTED
    const inviteRecord = memoryStore.invitations.find((i) => i.id === validInviteId);
    assert.strictEqual(inviteRecord?.status, "ACCEPTED");

    // Check member added to workspace
    const isMember = memoryStore.workspaceMembers.some(
      (m) => m.workspaceId === wsId && m.userId === outsiderId
    );
    assert.strictEqual(isMember, true);

    // Check MEMBER_JOINED audit log
    const joinAudit = memoryStore.auditLogs.find(
      (a) => a.action === "MEMBER_JOINED" && a.actorId === outsiderId
    );
    assert.ok(joinAudit);
    assert.strictEqual(joinAudit.workspaceId, wsId);

    // Attempting to accept again should fail
    await assert.rejects(
      async () => {
        await acceptWorkspaceInvitation(validRawToken, outsiderId);
      },
      { message: /already been accepted/ }
    );
  });

  it("Invitations - 7. acceptWorkspaceInvitation rejects tampered or expired tokens", async () => {
    // 1. Non-existent token
    await assert.rejects(
      async () => {
        await acceptWorkspaceInvitation("tampered-token-that-does-not-exist", outsiderId);
      },
      { message: /Invitation not found or invalid/ }
    );

    // 2. Expired token
    const expiredToken = "expired-token-raw-value-123456789012345678901234567890123456";
    const expHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
    memoryStore.invitations.push({
      id: "inv-expired-accept-test",
      workspaceId: wsId,
      email: "late@roblox.gg",
      role: "MEMBER",
      status: "PENDING",
      tokenHash: expHash,
      invitedById: ownerId,
      expiresAt: new Date(Date.now() - 5000).toISOString(),
      createdAt: new Date(Date.now() - 10000).toISOString(),
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    });

    await assert.rejects(
      async () => {
        await acceptWorkspaceInvitation(expiredToken, outsiderId);
      },
      { message: /This invitation has expired/ }
    );
  });

  it("Audit Log - 8. recordAuditEvent strictly sanitizes sensitive keys and truncates long values", async () => {
    const log = await recordAuditEvent({
      workspaceId: wsId,
      actorId: ownerId,
      action: "WORKSPACE_RENAMED",
      entityType: "WORKSPACE",
      metadata: {
        newName: "Sanitized Studio",
        password: "SuperSecretPassword123!",
        token: "SecretTokenString",
        cookie: "roxie_session=abc",
        secret: "TopSecretApiSecret",
        jwt: "eyJhbGciOi...",
        longDescription: "D".repeat(300),
      },
    });

    assert.strictEqual(log.metadata?.newName, "Sanitized Studio");
    assert.strictEqual(log.metadata?.password, undefined);
    assert.strictEqual(log.metadata?.token, undefined);
    assert.strictEqual(log.metadata?.cookie, undefined);
    assert.strictEqual(log.metadata?.secret, undefined);
    assert.strictEqual(log.metadata?.jwt, undefined);

    // Truncation check (> 200 chars becomes 200 chars + "...")
    const longVal = log.metadata?.longDescription as string;
    assert.strictEqual(longVal.length, 203);
    assert.strictEqual(longVal.endsWith("..."), true);
  });

  it("Audit Log - 9. getWorkspaceAuditLogs enforces workspace isolation and authorization", async () => {
    // Non-member access rejected
    const unknownUserId = "user-unknown-outsider";
    await assert.rejects(
      async () => {
        await getWorkspaceAuditLogs(wsId, unknownUserId);
      },
      { message: /Access denied: You are not a member of this workspace/ }
    );

    // Authorized member retrieves logs scoped strictly to this workspace
    const logs = await getWorkspaceAuditLogs(wsId, ownerId);
    assert.ok(logs.length > 0);
    assert.strictEqual(logs.every((l) => l.workspaceId === wsId), true);
  });

  it("Dashboard & Search - 10. Dashboard accurately reports workspace data with zero fabrication", async () => {
    // Create an empty workspace
    const emptyWsId = "ws-empty-test";
    memoryStore.workspaces.push({
      id: emptyWsId,
      name: "Empty Workspace",
      slug: "empty-workspace",
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    memoryStore.workspaceMembers.push({
      id: "wm-empty-owner",
      workspaceId: emptyWsId,
      userId: ownerId,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const metrics = await getWorkspaceDashboardMetrics(emptyWsId, ownerId);
    assert.strictEqual(metrics.workspace.id, emptyWsId);
    assert.strictEqual(metrics.role, "OWNER");
    assert.strictEqual(metrics.counts.ideas, 0);
    assert.strictEqual(metrics.counts.characters, 0);
    assert.strictEqual(metrics.counts.scripts, 0);
    assert.strictEqual(metrics.counts.videos, 0);
    assert.strictEqual(metrics.counts.events, 0);
    assert.strictEqual(metrics.recentIdeas.length, 0);
    assert.strictEqual(metrics.recentScripts.length, 0);
    assert.strictEqual(metrics.recentVideos.length, 0);
    assert.strictEqual(metrics.upcomingEvents.length, 0);
    assert.strictEqual(metrics.analyticsSummary.totalViews, 0);
    assert.strictEqual(metrics.analyticsSummary.publishedVideosCount, 0);
  });

  it("Dashboard & Search - 11. searchWorkspaceEntities isolates results strictly to active workspace", async () => {
    // Put item in wsId
    memoryStore.ideas.push({
      id: "idea-isolated-1",
      workspaceId: wsId,
      userId: ownerId,
      title: "Unique Search Keyword Roblox",
      description: "A secret idea in wsId",
      category: "MM2",
      status: "IDEA",
      priority: "HIGH",
      tags: ["roblox"],
      potentialScore: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Put item in otherWsId
    memoryStore.ideas.push({
      id: "idea-isolated-2",
      workspaceId: otherWsId,
      userId: ownerId,
      title: "Unique Search Keyword Roblox Other",
      description: "A secret idea in otherWsId",
      category: "MM2",
      status: "IDEA",
      priority: "HIGH",
      tags: ["roblox"],
      potentialScore: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Searching in wsId should ONLY return idea-isolated-1
    const results = await searchWorkspaceEntities(wsId, "Unique Search Keyword", ownerId);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "idea-isolated-1");
    assert.strictEqual(results[0].title, "Unique Search Keyword Roblox");

    // Cross-workspace leak verification
    const otherResults = await searchWorkspaceEntities(otherWsId, "Unique Search Keyword", ownerId);
    assert.strictEqual(otherResults.length, 1);
    assert.strictEqual(otherResults[0].id, "idea-isolated-2");
  });

  it("Invitations - 12. createWorkspaceInvitation generates unique tokens across calls", async () => {
    const inv1 = await createWorkspaceInvitation(wsId, "unique1@roblox.gg", "MEMBER", ownerId);
    const inv2 = await createWorkspaceInvitation(wsId, "unique2@roblox.gg", "MEMBER", ownerId);

    assert.notStrictEqual(inv1.rawToken, inv2.rawToken);
    assert.notStrictEqual(inv1.invitation.tokenHash, inv2.invitation.tokenHash);
  });

  it("Invitations - 13. acceptWorkspaceInvitation is idempotent if user is already a member", async () => {
    // Member accepting invite to workspace they already belong to returns membership without duplicating
    const memberInvite = await createWorkspaceInvitation(wsId, "already@roblox.gg", "MEMBER", ownerId);
    const result1 = await acceptWorkspaceInvitation(memberInvite.rawToken, memberId);
    assert.strictEqual(result1.workspaceId, wsId);

    // Member count did not grow redundantly
    const count = memoryStore.workspaceMembers.filter(
      (m) => m.workspaceId === wsId && m.userId === memberId
    ).length;
    assert.strictEqual(count, 1);
  });

  it("Invitations - 14. acceptWorkspaceInvitation rejects empty or blank tokens", async () => {
    await assert.rejects(
      async () => {
        await acceptWorkspaceInvitation("   ", outsiderId);
      },
      { message: /Invalid or missing invitation token/ }
    );
  });

  it("Invitations - 15. revokeWorkspaceInvitation rejects non-existent invitationId", async () => {
    await assert.rejects(
      async () => {
        await revokeWorkspaceInvitation(wsId, "inv-does-not-exist", ownerId);
      },
      { message: /Invitation not found/ }
    );
  });

  it("Search - 16. searchWorkspaceEntities returns empty array on blank query", async () => {
    const resEmpty = await searchWorkspaceEntities(wsId, "", ownerId);
    assert.strictEqual(resEmpty.length, 0);

    const resWhitespace = await searchWorkspaceEntities(wsId, "    ", ownerId);
    assert.strictEqual(resWhitespace.length, 0);
  });

  it("Dashboard - 17. getWorkspaceDashboardMetrics rejects non-members", async () => {
    await assert.rejects(
      async () => {
        await getWorkspaceDashboardMetrics(wsId, "user-non-member-unknown");
      },
      { message: /Access denied: You are not a member of this workspace/ }
    );
  });
});
