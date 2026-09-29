import { describe, it } from "node:test";
import assert from "node:assert";
import {
  canDeleteContent,
  canEditContent,
  canCreateContent,
  canManageMembers,
  canManageWorkspace,
  hasMinimumRole,
} from "../lib/auth/permissions";
import {
  createIdeaRecord,
  getIdeaById,
  getIdeas,
  updateIdeaRecord,
  deleteIdeaRecord,
} from "../lib/server/ideas";
import {
  createCharacterRecord,
  getCharacters,
  updateCharacterRecord,
} from "../lib/server/characters";
import {
  createScriptRecord,
  getScripts,
} from "../lib/server/scripts";
import {
  createVideoRecord,
  getVideos,
} from "../lib/server/videos";
import {
  createCalendarEventRecord,
  getCalendarEvents,
} from "../lib/server/calendar";
import { getAnalyticsData } from "../lib/server/analytics";

describe("Phase 7 - Authorization & Multi-Tenant Workspace Isolation", () => {
  it("Authz - 1. Role hierarchy and permissions", () => {
    // OWNER
    assert.strictEqual(hasMinimumRole("OWNER", "OWNER"), true);
    assert.strictEqual(hasMinimumRole("OWNER", "ADMIN"), true);
    assert.strictEqual(hasMinimumRole("OWNER", "MEMBER"), true);
    assert.strictEqual(canManageWorkspace("OWNER"), true);
    assert.strictEqual(canManageMembers("OWNER"), true);
    assert.strictEqual(canCreateContent("OWNER"), true);
    assert.strictEqual(canEditContent("OWNER"), true);
    assert.strictEqual(canDeleteContent("OWNER"), true);

    // ADMIN
    assert.strictEqual(hasMinimumRole("ADMIN", "OWNER"), false);
    assert.strictEqual(hasMinimumRole("ADMIN", "ADMIN"), true);
    assert.strictEqual(hasMinimumRole("ADMIN", "MEMBER"), true);
    assert.strictEqual(canManageWorkspace("ADMIN"), false);
    assert.strictEqual(canManageMembers("ADMIN"), true);
    assert.strictEqual(canCreateContent("ADMIN"), true);
    assert.strictEqual(canEditContent("ADMIN"), true);
    assert.strictEqual(canDeleteContent("ADMIN"), true);

    // MEMBER
    assert.strictEqual(hasMinimumRole("MEMBER", "OWNER"), false);
    assert.strictEqual(hasMinimumRole("MEMBER", "ADMIN"), false);
    assert.strictEqual(hasMinimumRole("MEMBER", "MEMBER"), true);
    assert.strictEqual(canManageWorkspace("MEMBER"), false);
    assert.strictEqual(canManageMembers("MEMBER"), false);
    assert.strictEqual(canCreateContent("MEMBER"), true);
    assert.strictEqual(canEditContent("MEMBER"), true);
    assert.strictEqual(canDeleteContent("MEMBER"), true);
  });

  it("Authz - 2. Multi-tenant workspace data isolation across all modules", async () => {
    const wsAlpha = "workspace-alpha-isolation";
    const userAlpha = "user-alpha-isolation";
    const wsBeta = "workspace-beta-isolation";
    const userBeta = "user-beta-isolation";

    // 1. Create content in Workspace Alpha
    const alphaIdea = await createIdeaRecord(
      {
        title: "Alpha Secret MM2 Strat",
        description: "Only visible in workspace Alpha",
        category: "MM2",
      },
      userAlpha,
      wsAlpha
    );

    const alphaChar = await createCharacterRecord(
      {
        name: "Alpha Detective",
        role: "MAIN",
        description: "Detective for Alpha",
      },
      userAlpha,
      wsAlpha
    );

    const alphaScript = await createScriptRecord(
      {
        title: "Alpha Mystery Pilot",
        description: "Alpha script screenplay",
      },
      userAlpha,
      wsAlpha
    );

    const alphaVideo = await createVideoRecord(
      {
        title: "Alpha Machinima Ep 1",
        description: "Alpha video file",
        platform: "YOUTUBE",
      },
      userAlpha,
      wsAlpha
    );

    const alphaEvent = await createCalendarEventRecord(
      {
        title: "Alpha Release Event",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        type: "VIDEO",
      },
      userAlpha,
      wsAlpha
    );

    // 2. Query content from Workspace Beta -> MUST NOT contain Alpha's records
    const betaIdeas = await getIdeas(userBeta, wsBeta);
    const betaChars = await getCharacters(userBeta, wsBeta);
    const betaScripts = await getScripts(userBeta, wsBeta);
    const betaVideos = await getVideos(userBeta, wsBeta);
    const betaEvents = await getCalendarEvents(userBeta, wsBeta);

    assert.ok(!betaIdeas.some((i) => i.id === alphaIdea.id), "Workspace Beta must NOT see Alpha ideas");
    assert.ok(!betaChars.some((c) => c.id === alphaChar.id), "Workspace Beta must NOT see Alpha characters");
    assert.ok(!betaScripts.some((s) => s.id === alphaScript.id), "Workspace Beta must NOT see Alpha scripts");
    assert.ok(!betaVideos.some((v) => v.id === alphaVideo.id), "Workspace Beta must NOT see Alpha videos");
    assert.ok(!betaEvents.some((e) => e.id === alphaEvent.id), "Workspace Beta must NOT see Alpha calendar events");

    // 3. Workspace Beta cannot inspect Alpha's idea by ID
    const crossIdea = await getIdeaById(alphaIdea.id, userBeta, wsBeta);
    assert.strictEqual(crossIdea, null, "Workspace Beta must NOT access Alpha idea by ID");

    // 4. Workspace Beta cannot update Alpha's idea
    await assert.rejects(
      async () => {
        await updateIdeaRecord(alphaIdea.id, { title: "Hacked by Beta" }, userBeta, wsBeta);
      },
      /Idea not found/,
      "Workspace Beta must NOT update Alpha idea"
    );

    // 5. Workspace Beta cannot delete Alpha's idea
    const deleteAttempt = await deleteIdeaRecord(alphaIdea.id, userBeta, wsBeta);
    assert.strictEqual(deleteAttempt, false, "Workspace Beta deletion attempt must fail");

    // Verify Alpha still has the idea untouched
    const alphaVerify = await getIdeaById(alphaIdea.id, userAlpha, wsAlpha);
    assert.ok(alphaVerify, "Alpha idea must remain intact");
    assert.strictEqual(alphaVerify.title, "Alpha Secret MM2 Strat");
  });

  it("Authz - 3. Multi-tenant Analytics Engine isolation", async () => {
    const wsDelta = "workspace-delta-analytics";
    const userDelta = "user-delta-analytics";
    const wsEcho = "workspace-echo-analytics";
    const userEcho = "user-echo-analytics";

    // Create video with views in Delta
    await createVideoRecord(
      {
        title: "Delta Million View Video",
        platform: "YOUTUBE",
        status: "PUBLISHED",
        publishedAt: new Date().toISOString(),
      },
      userDelta,
      wsDelta
    );

    // Compute analytics for Echo (which has 0 videos)
    const echoAnalytics = await getAnalyticsData(undefined, userEcho, wsEcho);
    assert.strictEqual(echoAnalytics.summary.videoCount, 0, "Echo workspace should have 0 videos");
    assert.strictEqual(echoAnalytics.summary.totalViews, 0, "Echo workspace should have 0 total views");
    assert.strictEqual(echoAnalytics.filteredVideos.length, 0);

    // Compute analytics for Delta
    const deltaAnalytics = await getAnalyticsData(undefined, userDelta, wsDelta);
    assert.strictEqual(deltaAnalytics.summary.videoCount, 1, "Delta workspace should reflect its own videos");
  });

  it("Authz - 4. Bi-directional isolation (Beta cannot access Alpha, Alpha cannot access Beta)", async () => {
    const ws1 = "workspace-bidir-1";
    const user1 = "user-bidir-1";
    const ws2 = "workspace-bidir-2";
    const user2 = "user-bidir-2";

    // 1 in ws1, 1 in ws2
    const char1 = await createCharacterRecord({ name: "Knight of WS1", role: "MAIN" }, user1, ws1);
    const char2 = await createCharacterRecord({ name: "Ranger of WS2", role: "SUPPORTING" }, user2, ws2);

    // WS1 querying characters
    const ws1Chars = await getCharacters(user1, ws1);
    assert.ok(ws1Chars.some((c) => c.id === char1.id), "WS1 should see char1");
    assert.ok(!ws1Chars.some((c) => c.id === char2.id), "WS1 must NOT see char2");

    // WS2 querying characters
    const ws2Chars = await getCharacters(user2, ws2);
    assert.ok(ws2Chars.some((c) => c.id === char2.id), "WS2 should see char2");
    assert.ok(!ws2Chars.some((c) => c.id === char1.id), "WS2 must NOT see char1");

    // WS1 cannot mutate WS2 character
    await assert.rejects(
      async () => {
        await updateCharacterRecord(char2.id, { name: "Renamed by WS1" }, user1, ws1);
      },
      /Character not found/
    );

    // WS2 cannot mutate WS1 character
    await assert.rejects(
      async () => {
        await updateCharacterRecord(char1.id, { name: "Renamed by WS2" }, user2, ws2);
      },
      /Character not found/
    );
  });

  it("Authz - 5. Content deletion permissions with author scoping", () => {
    // OWNER can delete any content in their workspace
    assert.strictEqual(canDeleteContent("OWNER", true), true);
    assert.strictEqual(canDeleteContent("OWNER", false), true);

    // ADMIN can delete any content in their workspace
    assert.strictEqual(canDeleteContent("ADMIN", true), true);
    assert.strictEqual(canDeleteContent("ADMIN", false), true);

    // MEMBER can only delete their own authored content
    assert.strictEqual(canDeleteContent("MEMBER", true), true);
    assert.strictEqual(canDeleteContent("MEMBER", false), false);
  });
});
