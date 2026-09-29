import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_VIDEOS } from "../lib/mock-videos";
import { INITIAL_CHARACTERS } from "../lib/mock-characters";
import { INITIAL_IDEAS } from "../lib/mock-ideas";
import { INITIAL_CALENDAR_EVENTS } from "../lib/mock-calendar";
import {
  calculateAverageComments,
  calculateAverageEngagement,
  calculateAverageLikes,
  calculateAverageViews,
  calculateCategoryPerformance,
  calculateCharacterPerformance,
  calculateCreatorInsights,
  calculateFormatPerformance,
  calculatePlatformMetrics,
  calculatePublishingActivity,
  calculateTopContent,
  calculateTotalComments,
  calculateTotalLikes,
  calculateTotalViews,
  calculateVideoEngagement,
  calculateViewsByDate,
  filterAnalyticsDataset,
  formatCompactNumber,
  formatNumber,
  formatPercent,
  MOCK_ANALYTICS_REFERENCE_DATE,
} from "../lib/analytics-utils";
import { Video } from "../lib/types";

test("Analytics - 1. Total Views Calculation", () => {
  const publishedOnly = INITIAL_VIDEOS.filter((v) => v.status === "PUBLISHED");
  const totalViews = calculateTotalViews(publishedOnly);

  assert.ok(totalViews > 0, "Total views should be greater than 0");
  const expected = publishedOnly.reduce((acc, v) => acc + (v.views || 0), 0);
  assert.equal(totalViews, expected);
});

test("Analytics - 2. Total Likes Calculation", () => {
  const publishedOnly = INITIAL_VIDEOS.filter((v) => v.status === "PUBLISHED");
  const totalLikes = calculateTotalLikes(publishedOnly);

  assert.ok(totalLikes > 0, "Total likes should be greater than 0");
  const expected = publishedOnly.reduce((acc, v) => acc + (v.likes || 0), 0);
  assert.equal(totalLikes, expected);
});

test("Analytics - 3. Total Comments Calculation", () => {
  const publishedOnly = INITIAL_VIDEOS.filter((v) => v.status === "PUBLISHED");
  const totalComments = calculateTotalComments(publishedOnly);

  assert.ok(totalComments > 0, "Total comments should be greater than 0");
  const expected = publishedOnly.reduce((acc, v) => acc + (v.comments || 0), 0);
  assert.equal(totalComments, expected);
});

test("Analytics - 4. Average Views Calculation", () => {
  const publishedOnly = INITIAL_VIDEOS.filter((v) => v.status === "PUBLISHED");
  const avgViews = calculateAverageViews(publishedOnly);

  assert.ok(avgViews > 0, "Average views should be positive");
  const expected = Math.round(calculateTotalViews(publishedOnly) / publishedOnly.length);
  assert.equal(avgViews, expected);
});

test("Analytics - 5. Engagement Calculation Formula", () => {
  // ((likes + comments) / views) * 100
  // e.g. 1,000 views, 50 likes, 10 comments => 60 / 1000 * 100 = 6%
  const rate = calculateVideoEngagement(1000, 50, 10);
  assert.equal(rate, 6);

  // Partial interaction: 10,000 views, 700 likes, 100 comments => 800 / 10000 * 100 = 8%
  const rate2 = calculateVideoEngagement(10000, 700, 100);
  assert.equal(rate2, 8);
});

test("Analytics - 6. Zero-View and Edge Case Handling", () => {
  // Zero views must not produce NaN or Infinity
  const zeroViewsRate = calculateVideoEngagement(0, 50, 10);
  assert.equal(zeroViewsRate, 0);
  assert.ok(!isNaN(zeroViewsRate));
  assert.ok(isFinite(zeroViewsRate));

  // Negative or NaN inputs
  const nanRate = calculateVideoEngagement(NaN, 10, 5);
  assert.equal(nanRate, 0);

  const negRate = calculateVideoEngagement(-100, 10, 5);
  assert.equal(negRate, 0);
});

test("Analytics - 7. Time Range Filtering", () => {
  // Reference date: 2026-09-29
  // 7D includes videos between Sep 22 and Sep 29
  const sevenDays = filterAnalyticsDataset(INITIAL_VIDEOS, {
    timeRange: "7D",
    referenceDate: MOCK_ANALYTICS_REFERENCE_DATE,
  });
  assert.ok(sevenDays.length > 0, "Should have videos in 7D range");
  for (const v of sevenDays) {
    const pub = new Date(v.publishedAt!).getTime();
    const cutoff = MOCK_ANALYTICS_REFERENCE_DATE.getTime() - 7 * 24 * 60 * 60 * 1000;
    assert.ok(pub >= cutoff, `Video ${v.id} published date ${v.publishedAt} before 7D cutoff`);
  }

  // 30D includes videos between Aug 30 and Sep 29
  const thirtyDays = filterAnalyticsDataset(INITIAL_VIDEOS, {
    timeRange: "30D",
    referenceDate: MOCK_ANALYTICS_REFERENCE_DATE,
  });
  assert.ok(thirtyDays.length >= sevenDays.length);

  // ALL includes all published videos
  const allTime = filterAnalyticsDataset(INITIAL_VIDEOS, { timeRange: "ALL" });
  const publishedCount = INITIAL_VIDEOS.filter((v) => v.status === "PUBLISHED").length;
  assert.equal(allTime.length, publishedCount);
});

test("Analytics - 8. Platform Filtering", () => {
  const ytOnly = filterAnalyticsDataset(INITIAL_VIDEOS, { platform: "YOUTUBE" });
  assert.ok(ytOnly.length > 0);
  assert.ok(ytOnly.every((v) => v.platform === "YOUTUBE" && v.status === "PUBLISHED"));

  const shortsOnly = filterAnalyticsDataset(INITIAL_VIDEOS, { platform: "YOUTUBE_SHORTS" });
  assert.ok(shortsOnly.length > 0);
  assert.ok(shortsOnly.every((v) => v.platform === "YOUTUBE_SHORTS" && v.status === "PUBLISHED"));
});

test("Analytics - 9. Combined Filtering (Time Range + Platform)", () => {
  const combined = filterAnalyticsDataset(INITIAL_VIDEOS, {
    timeRange: "30D",
    platform: "YOUTUBE_SHORTS",
    referenceDate: MOCK_ANALYTICS_REFERENCE_DATE,
  });

  assert.ok(combined.length > 0);
  for (const v of combined) {
    assert.equal(v.platform, "YOUTUBE_SHORTS");
    assert.equal(v.status, "PUBLISHED");
    const pub = new Date(v.publishedAt!).getTime();
    const cutoff = MOCK_ANALYTICS_REFERENCE_DATE.getTime() - 30 * 24 * 60 * 60 * 1000;
    assert.ok(pub >= cutoff);
  }
});

test("Analytics - 10. Views By Date Time-Series Aggregation", () => {
  const timeSeries = calculateViewsByDate(INITIAL_VIDEOS);
  assert.ok(timeSeries.length > 0, "Should generate time series data points");

  // Verify chronological ordering
  for (let i = 0; i < timeSeries.length - 1; i++) {
    const tA = new Date(timeSeries[i].date).getTime();
    const tB = new Date(timeSeries[i + 1].date).getTime();
    assert.ok(tA <= tB, "Time-series data points must be in chronological order");
  }

  // Verify points have valid numbers
  for (const pt of timeSeries) {
    assert.ok(pt.views >= 0);
    assert.ok(!isNaN(pt.engagementRate));
    assert.ok(pt.label.length > 0);
  }
});

test("Analytics - 11. Top Content Sorting and Limiting", () => {
  const top3 = calculateTopContent(INITIAL_VIDEOS, 3);
  assert.equal(top3.length, 3);

  // Descending view order
  for (let i = 0; i < top3.length - 1; i++) {
    assert.ok(
      (top3[i].views || 0) >= (top3[i + 1].views || 0),
      "Top content must be ordered descending by views"
    );
  }
});

test("Analytics - 12. Multi-Channel Platform Metrics Aggregation", () => {
  const platforms = calculatePlatformMetrics(INITIAL_VIDEOS);
  assert.equal(platforms.length, 4, "Should aggregate all 4 supported platforms");

  const platformNames = platforms.map((p) => p.platform);
  assert.ok(platformNames.includes("YOUTUBE"));
  assert.ok(platformNames.includes("YOUTUBE_SHORTS"));
  assert.ok(platformNames.includes("TIKTOK"));
  assert.ok(platformNames.includes("INSTAGRAM_REELS"));

  for (const pm of platforms) {
    assert.ok(pm.videos >= 0);
    assert.ok(pm.views >= 0);
    assert.ok(!isNaN(pm.engagementRate));
  }
});

test("Analytics - 13. Character Performance Aggregation", () => {
  const charStats = calculateCharacterPerformance(INITIAL_VIDEOS, INITIAL_CHARACTERS);
  assert.ok(charStats.length > 0, "Should have character stats");

  for (const cs of charStats) {
    assert.ok(cs.characterId);
    assert.ok(cs.appearances > 0);
    assert.ok(cs.totalViews >= 0);
    assert.ok(!isNaN(cs.averageEngagementRate));
  }
});

test("Analytics - 14. Publishing Activity Cadence Aggregation", () => {
  const activity = calculatePublishingActivity(INITIAL_VIDEOS, INITIAL_CALENDAR_EVENTS);
  assert.ok(activity.length >= 4, "Should have activity data for recent months");

  for (const act of activity) {
    assert.ok(act.period);
    assert.ok(act.published >= 0);
    assert.ok(act.scheduled >= 0);
    assert.ok(act.inProduction >= 0);
  }
});

test("Analytics - 15. Empty Dataset Behavior", () => {
  const empty: Video[] = [];

  assert.equal(calculateTotalViews(empty), 0);
  assert.equal(calculateTotalLikes(empty), 0);
  assert.equal(calculateTotalComments(empty), 0);
  assert.equal(calculateAverageViews(empty), 0);
  assert.equal(calculateAverageEngagement(empty), 0);
  assert.deepEqual(calculateViewsByDate(empty), []);
  assert.deepEqual(calculateTopContent(empty), []);
  assert.deepEqual(calculateCharacterPerformance(empty, INITIAL_CHARACTERS), []);
  assert.deepEqual(calculateCategoryPerformance(empty, INITIAL_IDEAS), []);

  const insights = calculateCreatorInsights(empty, INITIAL_IDEAS, INITIAL_CHARACTERS);
  assert.ok(insights.length >= 1);
  assert.equal(insights[0].id, "ins-empty");
});

test("Analytics - 16. Formatter Utility Behavior", () => {
  // formatNumber
  assert.equal(formatNumber(1240), "1,240");
  assert.equal(formatNumber(1245000), "1,245,000");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(NaN), "0");

  // formatCompactNumber
  assert.equal(formatCompactNumber(0), "0");
  assert.equal(formatCompactNumber(950), "950");
  assert.equal(formatCompactNumber(12400), "12.4K");
  assert.equal(formatCompactNumber(184000), "184K");
  assert.equal(formatCompactNumber(1840000), "1.84M");
  assert.equal(formatCompactNumber(1245000), "1.25M");

  // formatPercent
  assert.equal(formatPercent(8.42), "8.4%");
  assert.equal(formatPercent(0), "0.0%");
  assert.equal(formatPercent(NaN), "0.0%");
});
