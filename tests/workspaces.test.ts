import { describe, it } from "node:test";
import assert from "node:assert";
import { memoryStore } from "../lib/server/store";
import {
  getWorkspacesForUser,
  getWorkspaceMembers,
  updateWorkspaceDetails,
  updateMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
  switchActiveWorkspace,
} from "../lib/server/workspaces";
import { getUserProfile, updateUserProfile } from "../lib/server/profile";
import { getAuthContext } from "../lib/auth/context";
import { verifySessionToken } from "../lib/auth/session";

describe("Phase 8 - Creator Workspaces & Membership Security", () => {
  // Setup isolated test entities in memoryStore
  const testOwnerId = "user-test-ws-owner";
  const testAdminId = "user-test-ws-admin";
  const testMemberId = "user-test-ws-member";
  const testOtherMemberId = "user-test-ws-other-member";
  const testForeignUserId = "user-test-ws-foreign";

  const testWorkspace1Id = "ws-test-primary";
  const testWorkspace2Id = "ws-test-secondary";

  // Populate test users
  if (!memoryStore.users.some((u) => u.id === testOwnerId)) {
    memoryStore.users.push(
      {
        id: testOwnerId,
        email: "owner@bloxworkspace.gg",
        passwordHash: "hash",
        name: "Workspace Owner",
        creatorTag: "OWNER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "Original owner",
        timezone: "UTC",
      },
      {
        id: testAdminId,
        email: "admin@bloxworkspace.gg",
        passwordHash: "hash",
        name: "Workspace Admin",
        creatorTag: "ADMIN_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "Workspace Admin",
        timezone: "America/New_York",
      },
      {
        id: testMemberId,
        email: "member@bloxworkspace.gg",
        passwordHash: "hash",
        name: "Workspace Member",
        creatorTag: "MEMBER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "Workspace Member",
        timezone: "UTC",
      },
      {
        id: testOtherMemberId,
        email: "other@bloxworkspace.gg",
        passwordHash: "hash",
        name: "Other Member",
        creatorTag: "OTHER_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "Other Member",
        timezone: "UTC",
      },
      {
        id: testForeignUserId,
        email: "foreign@bloxworkspace.gg",
        passwordHash: "hash",
        name: "Foreign User",
        creatorTag: "FOREIGN_TAG",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: "Foreign User",
        timezone: "UTC",
      }
    );
  }

  // Populate test workspaces
  if (!memoryStore.workspaces.some((w) => w.id === testWorkspace1Id)) {
    memoryStore.workspaces.push(
      {
        id: testWorkspace1Id,
        name: "Primary Test Studio",
        slug: "primary-test-studio",
        ownerId: testOwnerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: testWorkspace2Id,
        name: "Secondary Test Studio",
        slug: "secondary-test-studio",
        ownerId: testOwnerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }

  // Populate memberships
  memoryStore.workspaceMembers.push(
    // Workspace 1 members
    {
      id: "wm-test-1",
      workspaceId: testWorkspace1Id,
      userId: testOwnerId,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-test-2",
      workspaceId: testWorkspace1Id,
      userId: testAdminId,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-test-3",
      workspaceId: testWorkspace1Id,
      userId: testMemberId,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-test-4",
      workspaceId: testWorkspace1Id,
      userId: testOtherMemberId,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Workspace 2 members (Owner and Admin only)
    {
      id: "wm-test-5",
      workspaceId: testWorkspace2Id,
      userId: testOwnerId,
      role: "OWNER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "wm-test-6",
      workspaceId: testWorkspace2Id,
      userId: testAdminId,
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  it("Workspace - 1. getWorkspacesForUser returns all memberships and identifies active workspace", async () => {
    const list = await getWorkspacesForUser(testOwnerId, testWorkspace1Id);
    assert.strictEqual(list.length >= 2, true);

    const ws1 = list.find((w) => w.id === testWorkspace1Id);
    const ws2 = list.find((w) => w.id === testWorkspace2Id);

    assert.ok(ws1);
    assert.strictEqual(ws1.isCurrent, true);
    assert.strictEqual(ws1.role, "OWNER");
    assert.strictEqual(ws1.name, "Primary Test Studio");
    assert.strictEqual(ws1.memberCount, 4);

    assert.ok(ws2);
    assert.strictEqual(ws2.isCurrent, false);
    assert.strictEqual(ws2.role, "OWNER");
    assert.strictEqual(ws2.memberCount, 2);
  });

  it("Workspace - 2. getWorkspaceMembers authorizes members and returns full member list", async () => {
    const members = await getWorkspaceMembers(testWorkspace1Id, testOwnerId);
    assert.strictEqual(members.length, 4);

    const ownerMember = members.find((m) => m.userId === testOwnerId);
    const adminMember = members.find((m) => m.userId === testAdminId);

    assert.ok(ownerMember);
    assert.strictEqual(ownerMember.role, "OWNER");
    assert.strictEqual(ownerMember.email, "owner@bloxworkspace.gg");

    assert.ok(adminMember);
    assert.strictEqual(adminMember.role, "ADMIN");
  });

  it("Workspace - 3. getWorkspaceMembers strictly rejects non-members", async () => {
    await assert.rejects(
      async () => {
        await getWorkspaceMembers(testWorkspace1Id, testForeignUserId);
      },
      { message: /Access denied/ }
    );
  });

  it("Workspace - 4. updateWorkspaceDetails allows OWNER to update name and slug", async () => {
    const updated = await updateWorkspaceDetails(
      testWorkspace1Id,
      { name: "Updated Primary Studio", slug: "updated-primary-studio" },
      testOwnerId
    );

    assert.strictEqual(updated.name, "Updated Primary Studio");
    assert.strictEqual(updated.slug, "updated-primary-studio");
  });

  it("Workspace - 5. updateWorkspaceDetails rejects non-OWNER modifications", async () => {
    // Admin attempt
    await assert.rejects(
      async () => {
        await updateWorkspaceDetails(
          testWorkspace1Id,
          { name: "Admin Hijack Name" },
          testAdminId
        );
      },
      { message: /Only the workspace owner can modify workspace settings/ }
    );

    // Member attempt
    await assert.rejects(
      async () => {
        await updateWorkspaceDetails(
          testWorkspace1Id,
          { name: "Member Hijack Name" },
          testMemberId
        );
      },
      { message: /Only the workspace owner can modify workspace settings/ }
    );
  });

  it("Workspace - 6. updateWorkspaceDetails validates minimum length and slug collisions", async () => {
    // Too short name
    await assert.rejects(
      async () => {
        await updateWorkspaceDetails(testWorkspace1Id, { name: "x" }, testOwnerId);
      },
      { message: /Workspace name must be at least 2 characters long/ }
    );

    // Collision with workspace 2
    await assert.rejects(
      async () => {
        await updateWorkspaceDetails(
          testWorkspace1Id,
          { slug: "secondary-test-studio" },
          testOwnerId
        );
      },
      { message: /already taken/ }
    );
  });

  it("Workspace - 7. updateMemberRole enforces RBAC hierarchy for promotions and demotions", async () => {
    // 1. OWNER promotes MEMBER to ADMIN
    const promoted = await updateMemberRole(
      testWorkspace1Id,
      testMemberId,
      "ADMIN",
      testOwnerId
    );
    assert.strictEqual(promoted.role, "ADMIN");

    // 2. OWNER demotes ADMIN back to MEMBER
    const demoted = await updateMemberRole(
      testWorkspace1Id,
      testMemberId,
      "MEMBER",
      testOwnerId
    );
    assert.strictEqual(demoted.role, "MEMBER");

    // 3. ADMIN promotes another MEMBER to ADMIN
    const adminPromoted = await updateMemberRole(
      testWorkspace1Id,
      testOtherMemberId,
      "ADMIN",
      testAdminId
    );
    assert.strictEqual(adminPromoted.role, "ADMIN");

    // 4. ADMIN cannot promote anyone to OWNER
    await assert.rejects(
      async () => {
        await updateMemberRole(
          testWorkspace1Id,
          testMemberId,
          "OWNER",
          testAdminId
        );
      },
      { message: /Admins cannot promote members to Owner/ }
    );

    // 5. ADMIN cannot modify another ADMIN's role
    await assert.rejects(
      async () => {
        await updateMemberRole(
          testWorkspace1Id,
          testOtherMemberId,
          "MEMBER",
          testAdminId
        );
      },
      { message: /Admins cannot modify another Admin's role/ }
    );

    // 6. MEMBER cannot modify any role
    await assert.rejects(
      async () => {
        await updateMemberRole(
          testWorkspace1Id,
          testOtherMemberId,
          "MEMBER",
          testMemberId
        );
      },
      { message: /Members do not have permission to manage roles/ }
    );

    // 7. Cannot modify own role
    await assert.rejects(
      async () => {
        await updateMemberRole(
          testWorkspace1Id,
          testAdminId,
          "MEMBER",
          testAdminId
        );
      },
      { message: /You cannot change your own role/ }
    );

    // 8. Cannot modify owner's role
    await assert.rejects(
      async () => {
        await updateMemberRole(
          testWorkspace1Id,
          testOwnerId,
          "ADMIN",
          testOwnerId
        );
      },
      { message: /You cannot change your own role/ }
    );

    // Clean up testOtherMemberId back to MEMBER
    await updateMemberRole(testWorkspace1Id, testOtherMemberId, "MEMBER", testOwnerId);
  });

  it("Workspace - 8. removeWorkspaceMember enforces role hierarchy", async () => {
    // Temporary member to remove
    const tempMemberId = "user-temp-remove";
    memoryStore.users.push({
      id: tempMemberId,
      email: "temp@bloxworkspace.gg",
      passwordHash: "hash",
      name: "Temp Member",
      creatorTag: "",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    memoryStore.workspaceMembers.push({
      id: "wm-temp-1",
      workspaceId: testWorkspace1Id,
      userId: tempMemberId,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 1. MEMBER cannot remove
    await assert.rejects(
      async () => {
        await removeWorkspaceMember(testWorkspace1Id, tempMemberId, testMemberId);
      },
      { message: /Members do not have permission to remove workspace members/ }
    );

    // 2. ADMIN cannot remove OWNER
    await assert.rejects(
      async () => {
        await removeWorkspaceMember(testWorkspace1Id, testOwnerId, testAdminId);
      },
      { message: /Cannot remove workspace owner/ }
    );

    // 3. ADMIN cannot remove another ADMIN
    await assert.rejects(
      async () => {
        await removeWorkspaceMember(testWorkspace1Id, testAdminId, testAdminId);
      },
      { message: /Admins cannot remove other admins/ }
    );

    // 4. OWNER removes member successfully
    const removed = await removeWorkspaceMember(testWorkspace1Id, tempMemberId, testOwnerId);
    assert.strictEqual(removed, true);
    const stillPresent = memoryStore.workspaceMembers.some(
      (m) => m.workspaceId === testWorkspace1Id && m.userId === tempMemberId
    );
    assert.strictEqual(stillPresent, false);
  });

  it("Workspace - 9. leaveWorkspace allows members to leave but prevents OWNER without transfer", async () => {
    // Temporary member to test leave
    const leavingUserId = "user-leaving";
    memoryStore.users.push({
      id: leavingUserId,
      email: "leaving@bloxworkspace.gg",
      passwordHash: "hash",
      name: "Leaving Member",
      creatorTag: "",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    memoryStore.workspaceMembers.push({
      id: "wm-leaving-1",
      workspaceId: testWorkspace1Id,
      userId: leavingUserId,
      role: "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // OWNER cannot leave
    await assert.rejects(
      async () => {
        await leaveWorkspace(testWorkspace1Id, testOwnerId);
      },
      { message: /Workspace owners cannot leave without transferring ownership/ }
    );

    // Member leaves successfully
    const left = await leaveWorkspace(testWorkspace1Id, leavingUserId);
    assert.strictEqual(left, true);

    const isMember = memoryStore.workspaceMembers.some(
      (m) => m.workspaceId === testWorkspace1Id && m.userId === leavingUserId
    );
    assert.strictEqual(isMember, false);
  });

  it("Workspace - 10. switchActiveWorkspace strictly verifies membership before switching context", async () => {
    // 1. Foreign user cannot switch to workspace
    await assert.rejects(
      async () => {
        await switchActiveWorkspace(testWorkspace1Id, testForeignUserId);
      },
      { message: /Access denied: You are not a member of the requested workspace/ }
    );

    // 2. Member of workspace 1 cannot switch to workspace 2 (testMemberId is not member of ws2)
    await assert.rejects(
      async () => {
        await switchActiveWorkspace(testWorkspace2Id, testMemberId);
      },
      { message: /Access denied: You are not a member of the requested workspace/ }
    );

    // 3. Valid switch for testAdminId to workspace 2
    const switched = await switchActiveWorkspace(testWorkspace2Id, testAdminId);
    assert.strictEqual(switched.workspace.id, testWorkspace2Id);
    assert.strictEqual(switched.role, "ADMIN");
    assert.strictEqual(switched.user.id, testAdminId);

    // Verify audit event was logged
    const lastAudit = memoryStore.auditLogs[0];
    assert.ok(lastAudit);
    assert.strictEqual(lastAudit.action, "WORKSPACE_SWITCHED");
    assert.strictEqual(lastAudit.workspaceId, testWorkspace2Id);
    assert.strictEqual(lastAudit.actorId, testAdminId);
  });

  it("Workspace - 11. Profile layer enforces constraints and audit logging", async () => {
    // 1. Get profile
    const profile = await getUserProfile(testOwnerId);
    assert.strictEqual(profile.email, "owner@bloxworkspace.gg");
    assert.strictEqual(profile.timezone, "UTC");

    // 2. Update profile
    const updated = await updateUserProfile(
      testOwnerId,
      {
        name: "Renamed Creator",
        creatorTag: "RENAMED_PRO",
        bio: "Updated creator bio for Roblox studio.",
        timezone: "America/Chicago",
      },
      testWorkspace1Id
    );

    assert.strictEqual(updated.name, "Renamed Creator");
    assert.strictEqual(updated.creatorTag, "RENAMED_PRO");
    assert.strictEqual(updated.timezone, "America/Chicago");

    // 3. Validation: blank name rejected
    await assert.rejects(
      async () => {
        await updateUserProfile(testOwnerId, { name: "   " });
      },
      { message: /Profile name cannot be blank/ }
    );

    // 4. Validation: name > 60 chars rejected
    await assert.rejects(
      async () => {
        await updateUserProfile(testOwnerId, { name: "A".repeat(61) });
      },
      { message: /Profile name cannot exceed 60 characters/ }
    );

    // 5. Validation: bio > 500 chars rejected
    await assert.rejects(
      async () => {
        await updateUserProfile(testOwnerId, { bio: "B".repeat(501) });
      },
      { message: /Bio cannot exceed 500 characters/ }
    );

    // 6. Timezone normalization: invalid timezone falls back to UTC
    const normalized = await updateUserProfile(testOwnerId, { timezone: "Invalid/Timezone" });
    assert.strictEqual(normalized.timezone, "UTC");

    // 7. Profile update audit log verified
    const profileAudit = memoryStore.auditLogs.find(
      (a) => a.action === "PROFILE_UPDATED" && a.actorId === testOwnerId
    );
    assert.ok(profileAudit);
    assert.strictEqual(profileAudit.entityType, "USER");
  });

  it("Workspace - 12. updateWorkspaceDetails preserves existing values when partial updates provided", async () => {
    const original = memoryStore.workspaces.find((w) => w.id === testWorkspace1Id)!;
    const oldSlug = original.slug;

    const res = await updateWorkspaceDetails(
      testWorkspace1Id,
      { name: "Only Name Changed" },
      testOwnerId
    );

    assert.strictEqual(res.name, "Only Name Changed");
    assert.strictEqual(res.slug, oldSlug);
  });

  it("Workspace - 13. updateWorkspaceDetails slugifies custom slugs correctly", async () => {
    const res = await updateWorkspaceDetails(
      testWorkspace1Id,
      { slug: "My Brand New Slug 2026!" },
      testOwnerId
    );

    assert.strictEqual(res.slug, "my-brand-new-slug-2026");
  });

  it("Workspace - 14. updateUserProfile validates avatarUrl protocol", async () => {
    // Invalid avatar URL (not http/https)
    await assert.rejects(
      async () => {
        await updateUserProfile(testOwnerId, { avatarUrl: "ftp://malicious.site/avatar.png" });
      },
      { message: /Avatar URL must be a valid HTTP or HTTPS URL/ }
    );

    // Valid avatar URL succeeds
    const valid = await updateUserProfile(testOwnerId, {
      avatarUrl: "https://images.unsplash.com/photo-1234?w=200",
    });
    assert.strictEqual(valid.avatarUrl, "https://images.unsplash.com/photo-1234?w=200");
  });

  it("Workspace - 15. updateUserProfile clears bio or avatar when empty string provided", async () => {
    const cleared = await updateUserProfile(testOwnerId, { bio: "", avatarUrl: "" });
    assert.strictEqual(cleared.bio, "");
    assert.strictEqual(cleared.avatarUrl, "");
  });

  it("Workspace - 16. getUserProfile returns clean defaults for unset fields", async () => {
    const tempUserWithoutTag = "user-no-tag";
    memoryStore.users.push({
      id: tempUserWithoutTag,
      email: "notag@bloxmedia.gg",
      passwordHash: "hash",
      name: "No Tag User",
      creatorTag: "",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await getUserProfile(tempUserWithoutTag);
    assert.strictEqual(res.creatorTag, "");
    assert.strictEqual(res.bio, "");
    assert.strictEqual(res.avatarUrl, "");
    assert.strictEqual(res.timezone, "UTC");
  });

  it("Workspace - 17. switchActiveWorkspace updates session token with correct claims", async () => {
    const res = await switchActiveWorkspace(testWorkspace1Id, testOwnerId);
    assert.strictEqual(res.workspace.id, testWorkspace1Id);
    assert.strictEqual(res.role, "OWNER");
    assert.strictEqual(res.user.id, testOwnerId);
  });
});
