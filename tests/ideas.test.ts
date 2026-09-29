import test from "node:test";
import assert from "node:assert";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import {
  filterIdeas,
  calculateIdeaStats,
  getNextStatus,
  validateIdeaForm,
  parseTags,
} from "../lib/ideas-utils";
import { IdeaItem, IdeaStatus } from "../lib/types";

test("Search filtering matches title correctly (case-insensitive)", () => {
  const results = filterIdeas(INITIAL_IDEAS, { search: "sheriff" });
  assert.ok(results.length >= 2, "Expected multiple ideas containing 'sheriff'");
  for (const idea of results) {
    const text = `${idea.title} ${idea.description} ${idea.tags.join(" ")}`.toLowerCase();
    assert.ok(text.includes("sheriff"), "Result must contain search term");
  }
});

test("Search filtering matches description and tags", () => {
  // Test description match
  const descResults = filterIdeas(INITIAL_IDEAS, { search: "machinima" });
  assert.ok(descResults.length > 0, "Should match idea by tag or description");

  // Test tag match
  const tagResults = filterIdeas(INITIAL_IDEAS, { search: "jumpscare" });
  assert.ok(tagResults.length > 0, "Should match idea with #Jumpscare tag");
});

test("Category filtering isolates designated Roblox categories", () => {
  const mm2Results = filterIdeas(INITIAL_IDEAS, { category: "MM2" });
  assert.ok(mm2Results.length > 0, "Should return MM2 ideas");
  for (const idea of mm2Results) {
    assert.strictEqual(idea.category, "MM2");
  }

  const storyResults = filterIdeas(INITIAL_IDEAS, { category: "STORY" });
  assert.ok(storyResults.length > 0, "Should return STORY ideas");
  for (const idea of storyResults) {
    assert.strictEqual(idea.category, "STORY");
  }
});

test("Status filtering filters by pipeline status", () => {
  const publishedResults = filterIdeas(INITIAL_IDEAS, { status: "PUBLISHED" });
  assert.ok(publishedResults.length > 0, "Should return published ideas");
  for (const idea of publishedResults) {
    assert.strictEqual(idea.status, "PUBLISHED");
  }

  const planningResults = filterIdeas(INITIAL_IDEAS, { status: "PLANNING" });
  assert.ok(planningResults.length > 0, "Should return planning ideas");
  for (const idea of planningResults) {
    assert.strictEqual(idea.status, "PLANNING");
  }
});

test("Priority filtering matches priority levels", () => {
  const hotResults = filterIdeas(INITIAL_IDEAS, { priority: "HOT" });
  assert.ok(hotResults.length >= 5, "Expected several HOT priority ideas");
  for (const idea of hotResults) {
    assert.strictEqual(idea.priority, "HOT");
  }
});

test("Combined filters work together (Category + Status + Search)", () => {
  const results = filterIdeas(INITIAL_IDEAS, {
    category: "MM2",
    status: "IDEA",
    search: "sheriff",
  });

  for (const idea of results) {
    assert.strictEqual(idea.category, "MM2");
    assert.strictEqual(idea.status, "IDEA");
    const combined = `${idea.title} ${idea.description}`.toLowerCase();
    assert.ok(combined.includes("sheriff"));
  }
});

test("Empty search results handled gracefully", () => {
  const results = filterIdeas(INITIAL_IDEAS, {
    search: "XYZNonExistentRobloxContentQuery12345",
  });
  assert.strictEqual(results.length, 0);
});

test("Statistics calculation dynamically derives metrics", () => {
  const stats = calculateIdeaStats(INITIAL_IDEAS);
  assert.strictEqual(stats.total, INITIAL_IDEAS.length);
  assert.strictEqual(
    stats.hot,
    INITIAL_IDEAS.filter((i) => i.priority === "HOT").length
  );
  assert.strictEqual(
    stats.planning,
    INITIAL_IDEAS.filter((i) => i.status === "PLANNING").length
  );
  assert.strictEqual(
    stats.production,
    INITIAL_IDEAS.filter((i) => i.status === "PRODUCTION").length
  );
  assert.strictEqual(
    stats.published,
    INITIAL_IDEAS.filter((i) => i.status === "PUBLISHED").length
  );
});

test("Status progression transitions linearly without skipping steps", () => {
  assert.strictEqual(getNextStatus("IDEA"), "PLANNING");
  assert.strictEqual(getNextStatus("PLANNING"), "SCRIPTING");
  assert.strictEqual(getNextStatus("SCRIPTING"), "PRODUCTION");
  assert.strictEqual(getNextStatus("PRODUCTION"), "PUBLISHED");
  assert.strictEqual(getNextStatus("PUBLISHED"), "ARCHIVED");
  assert.strictEqual(getNextStatus("ARCHIVED"), null, "Terminal status should return null");
});

test("Form validation requires title and description and validates score range", () => {
  // Empty title error
  const res1 = validateIdeaForm({
    title: "",
    description: "Good hook",
    category: "MM2",
    status: "IDEA",
    priority: "HIGH",
    potentialScore: 8,
  });
  assert.strictEqual(res1.isValid, false);
  assert.ok(res1.errors.title);

  // Score out of bounds (> 10)
  const res2 = validateIdeaForm({
    title: "Awesome Title",
    description: "Good hook",
    category: "MM2",
    status: "IDEA",
    priority: "HIGH",
    potentialScore: 11,
  });
  assert.strictEqual(res2.isValid, false);
  assert.ok(res2.errors.potentialScore);

  // Score out of bounds (< 1)
  const res3 = validateIdeaForm({
    title: "Awesome Title",
    description: "Good hook",
    category: "MM2",
    status: "IDEA",
    priority: "HIGH",
    potentialScore: 0,
  });
  assert.strictEqual(res3.isValid, false);
  assert.ok(res3.errors.potentialScore);

  // Valid submission
  const validRes = validateIdeaForm({
    title: "Valid Roblox Idea",
    description: "Valid Description hook",
    category: "MM2",
    status: "IDEA",
    priority: "HOT",
    potentialScore: 9.5,
  });
  assert.strictEqual(validRes.isValid, true);
  assert.strictEqual(Object.keys(validRes.errors).length, 0);
});

test("Tag parser cleans hashtags and whitespace", () => {
  const parsed = parseTags("#MM2, #SheriffFail , ComedySkit, , #Clutch");
  assert.deepStrictEqual(parsed, ["MM2", "SheriffFail", "ComedySkit", "Clutch"]);
});

test("CRUD state mutations behave as expected", () => {
  let list: IdeaItem[] = [...INITIAL_IDEAS];
  const initialLength = list.length;

  // Create
  const newIdea: IdeaItem = {
    id: "test-new-idea",
    title: "Unit Test New Idea",
    description: "Unit Test description",
    category: "TREND",
    status: "IDEA",
    priority: "HIGH",
    tags: ["TestTag"],
    potentialScore: 8.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list = [newIdea, ...list];
  assert.strictEqual(list.length, initialLength + 1);
  assert.strictEqual(list[0].id, "test-new-idea");

  // Read / Filter
  const found = list.find((i) => i.id === "test-new-idea");
  assert.ok(found);

  // Update
  list = list.map((item) =>
    item.id === "test-new-idea" ? { ...item, title: "Updated Title" } : item
  );
  assert.strictEqual(list[0].title, "Updated Title");

  // Delete
  list = list.filter((item) => item.id !== "test-new-idea");
  assert.strictEqual(list.length, initialLength);
  assert.strictEqual(list.find((i) => i.id === "test-new-idea"), undefined);
});
