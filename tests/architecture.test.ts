import test from "node:test";
import assert from "node:assert";
import { MAIN_NAV_ITEMS, CATEGORY_COLORS, STATUS_COLORS, PLATFORM_CONFIG } from "../lib/constants";
import { formatMetric, formatDuration } from "../lib/utils";

test("Navigation contains all 8 required Phase 1 routes", () => {
  const expectedRoutes = [
    "/dashboard",
    "/ideas",
    "/videos",
    "/scripts",
    "/characters",
    "/calendar",
    "/analytics",
    "/settings",
  ];

  const actualRoutes = MAIN_NAV_ITEMS.map((item) => item.href);
  for (const route of expectedRoutes) {
    assert.ok(actualRoutes.includes(route), `Route ${route} must exist in MAIN_NAV_ITEMS`);
  }
  assert.strictEqual(actualRoutes.length, 8);
});

test("Metric formatting handles counts accurately", () => {
  assert.strictEqual(formatMetric(950), "950");
  assert.strictEqual(formatMetric(1500), "1.5K");
  assert.strictEqual(formatMetric(24000), "24K");
  assert.strictEqual(formatMetric(1200000), "1.2M");
});

test("Duration formatting handles seconds properly", () => {
  assert.strictEqual(formatDuration(45), "0:45");
  assert.strictEqual(formatDuration(125), "2:05");
  assert.strictEqual(formatDuration(3661), "1:01:01");
});

test("Roblox content categories and statuses are defined", () => {
  const categories = ["MM2", "FUNNY", "STORY", "TREND", "SHORT", "LONG_VIDEO", "OTHER"];
  for (const cat of categories) {
    assert.ok(CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS], `Category ${cat} is configured`);
  }

  const statuses = ["IDEA", "PLANNING", "SCRIPTING", "PRODUCTION", "PUBLISHED", "ARCHIVED"];
  for (const st of statuses) {
    assert.ok(STATUS_COLORS[st as keyof typeof STATUS_COLORS], `Status ${st} is configured`);
  }
});
