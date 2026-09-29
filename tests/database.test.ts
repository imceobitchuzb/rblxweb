import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCalendarEventInput,
  validateCharacterInput,
  validateDialogueInput,
  validateIdeaInput,
  validateSceneInput,
  validateScriptInput,
  validateVideoInput,
} from "../lib/server/validation";
import {
  advanceIdeaStatusRecord,
  createIdeaRecord,
  deleteIdeaRecord,
  getIdeaById,
  getIdeas,
  updateIdeaRecord,
} from "../lib/server/ideas";
import {
  createCharacterRecord,
  deleteCharacterRecord,
  getCharacterById,
  getCharacters,
  updateCharacterRecord,
} from "../lib/server/characters";
import {
  createDialogueLineRecord,
  createSceneRecord,
  createScriptRecord,
  deleteDialogueLineRecord,
  deleteSceneRecord,
  deleteScriptRecord,
  getScriptById,
  getScripts,
  reorderScenesRecord,
  updateScriptRecord,
} from "../lib/server/scripts";
import {
  createVideoRecord,
  deleteVideoRecord,
  getVideoById,
  getVideos,
  updateVideoRecord,
} from "../lib/server/videos";
import {
  createCalendarEventRecord,
  deleteCalendarEventRecord,
  getCalendarEvents,
  updateCalendarEventRecord,
} from "../lib/server/calendar";
import { getAnalyticsData } from "../lib/server/analytics";
import {
  getUserSettings,
  updateUserSettingsRecord,
} from "../lib/server/settings";

// 1. Server Validation Rules
test("Validation - 1. Idea validation rules enforce boundaries", () => {
  // Empty title
  const noTitle = validateIdeaInput({ title: "" });
  assert.equal(noTitle.valid, false);
  assert.ok(noTitle.errors.title);

  // Score out of range
  const badScore = validateIdeaInput({ title: "Test Idea", potentialScore: 15 });
  assert.equal(badScore.valid, false);
  assert.ok(badScore.errors.potentialScore);

  // Invalid category
  const badCat = validateIdeaInput({ title: "Test Idea", category: "INVALID_CAT" });
  assert.equal(badCat.valid, false);
  assert.ok(badCat.errors.category);

  // Valid idea
  const valid = validateIdeaInput({
    title: "MM2 Chroma Knife Unboxing Challenge",
    category: "MM2",
    status: "IDEA",
    priority: "HOT",
    potentialScore: 9,
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test("Validation - 2. Character validation enforces required fields & role", () => {
  const noName = validateCharacterInput({ name: "" });
  assert.equal(noName.valid, false);

  const badRole = validateCharacterInput({ name: "Blox Hero", role: "SUPERMAN" });
  assert.equal(badRole.valid, false);

  const valid = validateCharacterInput({
    name: "Agent Void",
    role: "VILLAIN",
    personality: "Devious mastermind",
  });
  assert.equal(valid.valid, true);
});

test("Validation - 3. Script, Scene & Dialogue validation", () => {
  // Script
  const emptyScript = validateScriptInput({ title: "" });
  assert.equal(emptyScript.valid, false);

  // Scene
  const emptyScene = validateSceneInput({ title: "" });
  assert.equal(emptyScene.valid, false);

  // Dialogue
  const missingChar = validateDialogueInput({ text: "Hello world!", characterId: "" });
  assert.equal(missingChar.valid, false);

  const validDialogue = validateDialogueInput({
    characterId: "char-1",
    text: "Freeze, Sheriff Knox!",
    emotion: "ANGRY",
    duration: 2.5,
  });
  assert.equal(validDialogue.valid, true);
});

test("Validation - 4. Video and Calendar Event validation", () => {
  const badVideo = validateVideoInput({ title: "", platform: "MY_SPACE" });
  assert.equal(badVideo.valid, false);

  const badCal = validateCalendarEventInput({ title: "Drop", scheduledAt: "not-a-date" });
  assert.equal(badCal.valid, false);

  const validCal = validateCalendarEventInput({
    title: "Friday Premiere Drop",
    scheduledAt: "2026-10-05T18:00:00.000Z",
    type: "PREMIERE",
    status: "PLANNED",
  });
  assert.equal(validCal.valid, true);
});

// 2. Ideas Server Data Access & CRUD Lifecycle
test("Persistence - 5. Idea CRUD lifecycle and status progression", async () => {
  const initialIdeas = await getIdeas();
  const initialCount = initialIdeas.length;
  assert.ok(initialCount > 0, "Initial ideas should be loaded");

  // Create
  const created = await createIdeaRecord({
    title: "Persisted Test Idea — MM2 Glitch",
    description: "Testing automated persistence for glitch videos.",
    category: "MM2",
    status: "IDEA",
    priority: "HIGH",
    potentialScore: 8,
    tags: ["Test", "MM2"],
  });
  assert.ok(created.id, "Created idea must have an ID");
  assert.equal(created.title, "Persisted Test Idea — MM2 Glitch");

  // Read
  const fetched = await getIdeaById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.id, created.id);

  // Update
  const updated = await updateIdeaRecord(created.id, {
    title: "Persisted Test Idea — MM2 Glitch (Updated)",
    potentialScore: 10,
  });
  assert.equal(updated.title, "Persisted Test Idea — MM2 Glitch (Updated)");
  assert.equal(updated.potentialScore, 10);

  // Advance Status (IDEA -> PLANNING)
  const advanced = await advanceIdeaStatusRecord(created.id);
  assert.equal(advanced.status, "PLANNING");

  // Delete
  const deleted = await deleteIdeaRecord(created.id);
  assert.equal(deleted, true);

  const checkDeleted = await getIdeaById(created.id);
  assert.equal(checkDeleted, null);
});

// 3. Character Server Data Access & Dependency Protection
test("Persistence - 6. Character CRUD and screenplay reference protection", async () => {
  // Create a character
  const char = await createCharacterRecord({
    name: "Doctor Bloxstein",
    role: "VILLAIN",
    description: "Mad scientist crafting explosive bloxi-cola potions.",
    personality: "Eccentric, cackles frequently.",
  });
  assert.ok(char.id);

  // Attempting to delete an unreferenced character should succeed
  const deleted = await deleteCharacterRecord(char.id);
  assert.equal(deleted, true);

  // Attempting to delete an existing character that IS referenced in scripts (e.g. Sheriff Knox)
  const knox = (await getCharacters()).find((c) => c.name.includes("Knox"));
  if (knox) {
    await assert.rejects(
      async () => {
        await deleteCharacterRecord(knox.id);
      },
      /Cannot delete character: referenced in/
    );
  }
});

// 4. Script, Scene, and Dialogue Data Access
test("Persistence - 7. Script, Scene, and Dialogue nested hierarchy", async () => {
  // 1. Create screenplay
  const script = await createScriptRecord({
    title: "The Great Blox Heist",
    hook: "Three noobs walked into the bank... only one walked out with Robux.",
    status: "DRAFT",
    tags: ["Machinima", "Heist"],
  });
  assert.ok(script.id);

  // 2. Add scene
  const scene = await createSceneRecord(script.id, {
    title: "Planning in the Sewer",
    description: "The crew examines blueprints under candlelight.",
    duration: 15,
  });
  assert.ok(scene.id);

  // 3. Add dialogue line
  const line = await createDialogueLineRecord(scene.id, {
    characterId: "char-noob",
    text: "Guys, are you sure the vault door isn't made of bedrock?",
    emotion: "CONFUSED",
    duration: 3.5,
  });
  assert.ok(line.id);
  assert.equal(line.text, "Guys, are you sure the vault door isn't made of bedrock?");

  // 4. Update script
  const updatedScript = await updateScriptRecord(script.id, {
    status: "READY",
  });
  assert.equal(updatedScript.status, "READY");

  // 5. Delete dialogue line
  const lineDeleted = await deleteDialogueLineRecord(line.id);
  assert.equal(lineDeleted, true);

  // 6. Delete scene
  const sceneDeleted = await deleteSceneRecord(scene.id);
  assert.equal(sceneDeleted, true);

  // 7. Delete script
  const scriptDeleted = await deleteScriptRecord(script.id);
  assert.equal(scriptDeleted, true);
});

// 5. Video Data Access & Script Linkage
test("Persistence - 8. Video creation with script linkage and metrics update", async () => {
  const video = await createVideoRecord({
    title: "100 Players Survived 100 Days in Brookhaven",
    platform: "YOUTUBE",
    status: "IN_PRODUCTION",
    duration: 720,
    tags: ["Brookhaven", "Challenge"],
  });
  assert.ok(video.id);

  // Update views and likes
  const updated = await updateVideoRecord(video.id, {
    views: 50000,
    likes: 3500,
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
  });
  assert.equal(updated.views, 50000);
  assert.equal(updated.likes, 3500);
  assert.equal(updated.status, "PUBLISHED");

  // Clean up
  await deleteVideoRecord(video.id);
  const verify = await getVideoById(video.id);
  assert.equal(verify, null);
});

// 6. Calendar Event Persistence
test("Persistence - 9. Calendar Event scheduling and update", async () => {
  const event = await createCalendarEventRecord({
    title: "Saturday Live Stream Obby",
    scheduledAt: "2026-10-10T19:00:00.000Z",
    type: "PREMIERE",
    platform: "YOUTUBE",
    status: "PLANNED",
  });
  assert.ok(event.id);

  const updated = await updateCalendarEventRecord(event.id, {
    status: "READY",
  });
  assert.equal(updated.status, "READY");

  const deleted = await deleteCalendarEventRecord(event.id);
  assert.equal(deleted, true);
});

// 7. Creator Analytics Persisted Data Consumption
test("Persistence - 10. Analytics engine consumes persisted records", async () => {
  const analytics = await getAnalyticsData({ timeRange: "ALL" });

  assert.ok(analytics.filteredVideos.length > 0);
  assert.ok(analytics.summary.totalViews > 0);
  assert.ok(analytics.summary.averageViews > 0);
  assert.ok(analytics.summary.averageEngagement >= 0);
  assert.ok(analytics.platformMetrics.length === 4);
  assert.ok(analytics.insights.length > 0);
});

// 8. User Settings Persistence
test("Persistence - 11. User Settings read and update", async () => {
  const settings = await getUserSettings();
  assert.ok(settings.userId);

  const updated = await updateUserSettingsRecord({
    emailNotifications: false,
    theme: "dark",
  });
  assert.equal(updated.emailNotifications, false);
});
