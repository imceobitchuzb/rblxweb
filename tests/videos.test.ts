import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_VIDEOS } from "../lib/mock-videos";
import { INITIAL_SCRIPTS } from "../lib/mock-scripts";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import {
  createVideoFromScript,
  filterVideos,
  formatDuration,
  formatMetric,
  validateVideoForm,
} from "../lib/video-calendar-utils";
import { Video } from "../lib/types";

test("Video Studio - Dataset Integrity", () => {
  assert.ok(INITIAL_VIDEOS.length >= 10, "Should have at least 10 initial videos");

  for (const video of INITIAL_VIDEOS) {
    assert.ok(video.id, "Video must have an id");
    assert.ok(video.title, "Video must have a title");
    assert.ok(video.platform, "Video must have a platform");
    assert.ok(video.status, "Video must have a status");
    assert.ok(Array.isArray(video.characterIds), "Video must have characterIds array");
    assert.ok(typeof video.duration === "number", "Video duration must be number");
  }
});

test("Video Studio - Cross-Module Relational Integrity", () => {
  const scriptIds = new Set(INITIAL_SCRIPTS.map((s) => s.id));
  const ideaIds = new Set(INITIAL_IDEAS.map((i) => i.id));
  const charIds = new Set(INITIAL_CHARACTERS.map((c) => c.id));

  for (const video of INITIAL_VIDEOS) {
    if (video.scriptId) {
      assert.ok(
        scriptIds.has(video.scriptId),
        `Video ${video.id} references non-existent script: ${video.scriptId}`
      );
    }
    if (video.ideaId) {
      assert.ok(
        ideaIds.has(video.ideaId),
        `Video ${video.id} references non-existent idea: ${video.ideaId}`
      );
    }
    for (const cId of video.characterIds) {
      assert.ok(
        charIds.has(cId),
        `Video ${video.id} references non-existent character: ${cId}`
      );
    }
  }
});

test("Video Studio - filterVideos search and filtering", () => {
  // Search query test
  const searchResults = filterVideos(INITIAL_VIDEOS, { search: "Bacon Benny" });
  assert.ok(searchResults.length >= 1, "Should find videos mentioning Bacon Benny");
  assert.ok(
    searchResults.every(
      (v) =>
        v.title.toLowerCase().includes("bacon benny") ||
        v.description.toLowerCase().includes("bacon benny")
    )
  );

  // Platform filter test
  const ytShorts = filterVideos(INITIAL_VIDEOS, { platform: "YOUTUBE_SHORTS" });
  assert.ok(ytShorts.length > 0);
  assert.ok(ytShorts.every((v) => v.platform === "YOUTUBE_SHORTS"));

  // Status filter test
  const publishedOnly = filterVideos(INITIAL_VIDEOS, { status: "PUBLISHED" });
  assert.ok(publishedOnly.length >= 2);
  assert.ok(publishedOnly.every((v) => v.status === "PUBLISHED"));
});

test("Video Studio - filterVideos sorting", () => {
  // Sort by views descending
  const byViews = filterVideos(INITIAL_VIDEOS, { sortBy: "views", sortOrder: "desc" });
  for (let i = 0; i < byViews.length - 1; i++) {
    assert.ok(
      (byViews[i].views || 0) >= (byViews[i + 1].views || 0),
      "Views should be in descending order"
    );
  }

  // Sort by duration ascending
  const byDuration = filterVideos(INITIAL_VIDEOS, { sortBy: "duration", sortOrder: "asc" });
  for (let i = 0; i < byDuration.length - 1; i++) {
    assert.ok(
      byDuration[i].duration <= byDuration[i + 1].duration,
      "Duration should be in ascending order"
    );
  }
});

test("Video Studio - validateVideoForm", () => {
  // Valid form
  const valid = validateVideoForm({
    title: "Awesome MM2 Short",
    platform: "TIKTOK",
    status: "READY",
    duration: 30,
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);

  // Missing title
  const noTitle = validateVideoForm({
    title: "",
    platform: "YOUTUBE",
    status: "PLANNING",
  });
  assert.equal(noTitle.valid, false);
  assert.ok(noTitle.errors.title);

  // Negative duration
  const negDuration = validateVideoForm({
    title: "Negative Dur",
    platform: "YOUTUBE",
    status: "PLANNING",
    duration: -10,
  });
  assert.equal(negDuration.valid, false);
  assert.ok(negDuration.errors.duration);
});

test("Video Studio - createVideoFromScript workflow conversion", () => {
  const script = INITIAL_SCRIPTS[0]; // "He Had ONE Job"
  const converted = createVideoFromScript(script, "YOUTUBE_SHORTS");

  assert.equal(converted.title, script.title);
  assert.equal(converted.scriptId, script.id);
  assert.equal(converted.ideaId, script.ideaId);
  assert.deepEqual(converted.characterIds, script.characters);
  assert.equal(converted.platform, "YOUTUBE_SHORTS");
  assert.equal(converted.status, "READY");
});

test("Video Studio - formatDuration and formatMetric", () => {
  // formatDuration
  assert.equal(formatDuration(42), "0:42");
  assert.equal(formatDuration(65), "1:05");
  assert.equal(formatDuration(3665), "1:01:05");
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(-5), "0:00");

  // formatMetric
  assert.equal(formatMetric(0), "0");
  assert.equal(formatMetric(950), "950");
  assert.equal(formatMetric(1420), "1.4K");
  assert.equal(formatMetric(38400), "38.4K");
  assert.equal(formatMetric(1245000), "1.2M");
});
