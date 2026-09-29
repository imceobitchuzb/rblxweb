import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_CALENDAR_EVENTS } from "../lib/mock-calendar";
import { INITIAL_VIDEOS } from "../lib/mock-videos";
import {
  createScheduleEventFromVideo,
  filterCalendarEvents,
  getMonthGrid,
  getUpcomingEvents,
  getWeekDays,
} from "../lib/video-calendar-utils";

test("Content Calendar - Dataset Integrity", () => {
  assert.ok(
    INITIAL_CALENDAR_EVENTS.length >= 8,
    "Should have at least 8 initial calendar events"
  );

  for (const event of INITIAL_CALENDAR_EVENTS) {
    assert.ok(event.id, "Event must have id");
    assert.ok(event.title, "Event must have title");
    assert.ok(event.type, "Event must have type");
    assert.ok(event.platform, "Event must have platform");
    assert.ok(event.status, "Event must have status");
    assert.ok(event.scheduledAt, "Event must have scheduledAt");
    assert.ok(!isNaN(new Date(event.scheduledAt).getTime()), "scheduledAt must be valid date");
  }
});

test("Content Calendar - Video Relational Integrity", () => {
  const videoIds = new Set(INITIAL_VIDEOS.map((v) => v.id));

  for (const event of INITIAL_CALENDAR_EVENTS) {
    if (event.videoId) {
      assert.ok(
        videoIds.has(event.videoId),
        `Calendar event ${event.id} references non-existent video: ${event.videoId}`
      );
    }
  }
});

test("Content Calendar - filterCalendarEvents", () => {
  // Filter by platform
  const ytOnly = filterCalendarEvents(INITIAL_CALENDAR_EVENTS, { platform: "YOUTUBE" });
  assert.ok(ytOnly.length > 0);
  assert.ok(ytOnly.every((e) => e.platform === "YOUTUBE"));

  // Filter by type
  const premieres = filterCalendarEvents(INITIAL_CALENDAR_EVENTS, { type: "PREMIERE" });
  assert.ok(premieres.length > 0);
  assert.ok(premieres.every((e) => e.type === "PREMIERE"));

  // Filter by search query
  const searchResults = filterCalendarEvents(INITIAL_CALENDAR_EVENTS, { search: "AFK" });
  assert.ok(searchResults.length >= 1);
  assert.ok(searchResults[0].title.includes("AFK"));
});

test("Content Calendar - getUpcomingEvents", () => {
  const refDate = new Date("2026-09-29T12:00:00.000Z");
  const upcoming = getUpcomingEvents(INITIAL_CALENDAR_EVENTS, 5, refDate);

  assert.ok(upcoming.length > 0, "Should have upcoming events");
  assert.ok(upcoming.length <= 5, "Should respect limit");

  // Verify none are published or cancelled
  for (const event of upcoming) {
    assert.notEqual(event.status, "PUBLISHED");
    assert.notEqual(event.status, "CANCELLED");
    assert.ok(new Date(event.scheduledAt).getTime() >= refDate.getTime());
  }

  // Verify sorted chronologically
  for (let i = 0; i < upcoming.length - 1; i++) {
    const tA = new Date(upcoming[i].scheduledAt).getTime();
    const tB = new Date(upcoming[i + 1].scheduledAt).getTime();
    assert.ok(tA <= tB, "Upcoming events must be in ascending chronological order");
  }
});

test("Content Calendar - createScheduleEventFromVideo", () => {
  const video = INITIAL_VIDEOS[0];
  const scheduledTime = "2026-10-15T18:00:00.000Z";
  const notes = "Big community launch event";

  const event = createScheduleEventFromVideo(video, scheduledTime, notes);

  assert.equal(event.videoId, video.id);
  assert.equal(event.title, video.title);
  assert.equal(event.platform, video.platform);
  assert.equal(event.scheduledAt, scheduledTime);
  assert.equal(event.notes, notes);
  assert.equal(event.type, "VIDEO");
  assert.equal(event.status, "PLANNED");
});

test("Content Calendar - getMonthGrid and getWeekDays", () => {
  // Month grid for September 2026 (Month index 8)
  const sepGrid = getMonthGrid(2026, 8, INITIAL_CALENDAR_EVENTS);
  assert.equal(sepGrid.length % 7, 0, "Month grid must be a multiple of 7");
  assert.ok(sepGrid.length >= 35, "Grid should have at least 35 cells");

  // Check September has 30 days marked as isCurrentMonth
  const sepCurrentDays = sepGrid.filter((c) => c.isCurrentMonth);
  assert.equal(sepCurrentDays.length, 30, "September has 30 days");

  // Week days
  const weekDays = getWeekDays(
    new Date("2026-09-29T12:00:00.000Z"),
    INITIAL_CALENDAR_EVENTS
  );
  assert.equal(weekDays.length, 7, "Week grid must have 7 days");
});
