import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_VIDEOS } from "../lib/mock-videos";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import { INITIAL_SCRIPTS } from "../lib/mock-scripts";
import { INITIAL_CALENDAR_EVENTS } from "../lib/mock-calendar";
import {
  performGlobalSearch,
  getTotalResultCount,
  SearchDataset,
} from "../lib/search-utils";
import { deriveWorkspaceNotifications } from "../lib/notification-utils";

const sampleDataset: SearchDataset = {
  ideas: INITIAL_IDEAS,
  characters: INITIAL_CHARACTERS,
  scripts: INITIAL_SCRIPTS,
  videos: INITIAL_VIDEOS,
};

test("Shell & Navigation - 1. Empty or Whitespace Query", () => {
  const emptyRes = performGlobalSearch("", sampleDataset);
  assert.equal(getTotalResultCount(emptyRes), 0);
  assert.equal(emptyRes.ideas.length, 0);
  assert.equal(emptyRes.characters.length, 0);
  assert.equal(emptyRes.scripts.length, 0);
  assert.equal(emptyRes.videos.length, 0);

  const whitespaceRes = performGlobalSearch("    ", sampleDataset);
  assert.equal(getTotalResultCount(whitespaceRes), 0);
});

test("Shell & Navigation - 2. Search Ideas by Title and Tag", () => {
  // "Doors" is present in ideas
  const res = performGlobalSearch("doors", sampleDataset);
  assert.ok(res.ideas.length > 0, "Should find ideas matching doors");
  assert.ok(
    res.ideas.some((i) =>
      i.title.toLowerCase().includes("doors") ||
      i.tags.some((t) => t.toLowerCase().includes("doors"))
    )
  );

  // Search by specific tag
  const horrorRes = performGlobalSearch("horror", sampleDataset);
  assert.ok(horrorRes.ideas.length > 0, "Should find ideas with horror tag");
});

test("Shell & Navigation - 3. Search Characters by Name and Personality", () => {
  const res = performGlobalSearch("Knox", sampleDataset);
  assert.ok(res.characters.length > 0, "Should find Knox character");
  assert.equal(res.characters[0].name, "Sheriff Knox");
  assert.ok(res.characters[0].href.includes("/characters?search="));
  assert.ok(res.characters[0].subtitle.length > 0);

  // By personality trait
  const villainRes = performGlobalSearch("theatrical", sampleDataset);
  assert.ok(villainRes.characters.length > 0, "Should find character by personality");
  assert.equal(villainRes.characters[0].name, "Slick Blade (The Murderer)");
});

test("Shell & Navigation - 4. Search Scripts by Title and Hook", () => {
  const res = performGlobalSearch("He Had ONE Job", sampleDataset);
  assert.ok(res.scripts.length > 0, "Should find scripts matching He Had ONE Job");
  assert.ok(res.scripts[0].title.toLowerCase().includes("he had one job"));
  assert.ok(res.scripts[0].href.includes("/scripts?scriptId="));
  assert.ok(res.scripts[0].scenesCount > 0);
});

test("Shell & Navigation - 5. Search Videos by Platform and Content", () => {
  const res = performGlobalSearch("Sheriff Fail", sampleDataset);
  assert.ok(res.videos.length > 0, "Should find videos matching Sheriff Fail");
  assert.ok(res.videos[0].title.toLowerCase().includes("sheriff fail"));
  assert.ok(res.videos[0].href.includes("/videos?videoId="));
  assert.ok(res.videos[0].platform.length > 0);
});

test("Shell & Navigation - 6. Cross-Entity Unified Search Hits", () => {
  // "Roblox" matches across ideas, scripts, and videos
  const res = performGlobalSearch("roblox", sampleDataset);
  const total = getTotalResultCount(res);
  assert.ok(total > 1, "Roblox should match multiple items across categories");

  // Verify slice limits: each category should not exceed 5 results
  assert.ok(res.ideas.length <= 5);
  assert.ok(res.characters.length <= 5);
  assert.ok(res.scripts.length <= 5);
  assert.ok(res.videos.length <= 5);
});

test("Shell & Navigation - 7. Derive Notifications from Workspace State", () => {
  const notifications = deriveWorkspaceNotifications(
    INITIAL_VIDEOS,
    INITIAL_SCRIPTS,
    INITIAL_IDEAS,
    INITIAL_CALENDAR_EVENTS
  );

  assert.ok(notifications.length > 0, "Should generate notifications");

  // Verify scheduled video notification exists
  const hasScheduled = notifications.some((n) => n.id.startsWith("notif-sched-"));
  assert.ok(hasScheduled, "Should have scheduled release notification");

  // Verify ready video notification exists
  const hasReadyVid = notifications.some((n) => n.id.startsWith("notif-ready-vid-"));
  assert.ok(hasReadyVid, "Should have ready video notification");

  // Verify ready script notification exists
  const hasReadyScript = notifications.some((n) => n.id.startsWith("notif-script-"));
  assert.ok(hasReadyScript, "Should have approved screenplay notification");

  // Verify notification item schema integrity
  for (const n of notifications) {
    assert.ok(n.id.length > 0);
    assert.ok(n.title.length > 0);
    assert.ok(n.message.length > 0);
    assert.ok(["info", "warning", "success", "action"].includes(n.type));
    assert.ok(n.href.startsWith("/"));
    assert.equal(typeof n.isRead, "boolean");
  }
});

test("Shell & Navigation - 8. Empty Dataset Notification Resilience", () => {
  const notifications = deriveWorkspaceNotifications([], [], [], []);
  assert.equal(notifications.length, 0, "Empty dataset should yield 0 notifications without error");
});
