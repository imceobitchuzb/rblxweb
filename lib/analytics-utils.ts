import {
  AnalyticsTimeRange,
  CalendarEvent,
  CategoryPerformance,
  Character,
  CharacterAnalytics,
  CreatorInsight,
  FormatPerformance,
  IdeaItem,
  PlatformMetrics,
  PublishingActivityData,
  TimeSeriesDataPoint,
  Video,
  VideoPlatform,
} from "./types";
import { ALL_VIDEO_PLATFORMS } from "./constants";

export interface AnalyticsFilterOptions {
  timeRange?: AnalyticsTimeRange;
  platform?: VideoPlatform | "ALL";
  referenceDate?: Date;
}

// Fixed anchor date for mock workspace consistency
export const MOCK_ANALYTICS_REFERENCE_DATE = new Date("2026-09-29T12:00:00.000Z");

/**
 * Formats a number with comma separators (e.g., 1,240).
 */
export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return "0";
  return Math.round(num).toLocaleString("en-US");
}

/**
 * Formats a metric into compact human-readable notation (e.g., 12.4K, 184K, 1.84M).
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num) || !isFinite(num) || num === 0) return "0";
  const abs = Math.abs(num);
  if (abs >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "");
    return `${formatted}M`;
  }
  if (abs >= 1_000) {
    const formatted = (num / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}K`;
  }
  return Math.round(num).toString();
}

/**
 * Formats a percentage value cleanly (e.g., "8.4%").
 */
export function formatPercent(num: number): string {
  if (isNaN(num) || !isFinite(num)) return "0.0%";
  return `${num.toFixed(1)}%`;
}

/**
 * Calculates video engagement rate: ((likes + comments) / views) * 100.
 * Safely handles zero views, NaN, and Infinity.
 */
export function calculateVideoEngagement(views: number, likes: number, comments: number): number {
  if (isNaN(views) || views <= 0) return 0;
  const safeLikes = isNaN(likes) || likes < 0 ? 0 : likes;
  const safeComments = isNaN(comments) || comments < 0 ? 0 : comments;
  const rate = ((safeLikes + safeComments) / views) * 100;
  return isFinite(rate) ? rate : 0;
}

/**
 * Filters video dataset according to time range and platform.
 * Applies only to published videos unless specified otherwise.
 */
export function filterAnalyticsDataset(
  videos: Video[],
  options: AnalyticsFilterOptions = {}
): Video[] {
  const {
    timeRange = "ALL",
    platform = "ALL",
    referenceDate = MOCK_ANALYTICS_REFERENCE_DATE,
  } = options;

  const refTime = referenceDate.getTime();

  return videos.filter((video) => {
    // Only published videos have analytics metrics
    if (video.status !== "PUBLISHED") {
      return false;
    }

    // Platform filter
    if (platform !== "ALL" && video.platform !== platform) {
      return false;
    }

    // Time range filter based on publishedAt
    if (timeRange !== "ALL") {
      if (!video.publishedAt) return false;
      const pubTime = new Date(video.publishedAt).getTime();
      if (isNaN(pubTime)) return false;

      let days = 30;
      if (timeRange === "7D") days = 7;
      if (timeRange === "90D") days = 90;

      const cutoffTime = refTime - days * 24 * 60 * 60 * 1000;
      if (pubTime < cutoffTime || pubTime > refTime + 24 * 60 * 60 * 1000) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculates total views across given videos.
 */
export function calculateTotalViews(videos: Video[]): number {
  return videos.reduce((acc, v) => acc + (v.views || 0), 0);
}

/**
 * Calculates total likes across given videos.
 */
export function calculateTotalLikes(videos: Video[]): number {
  return videos.reduce((acc, v) => acc + (v.likes || 0), 0);
}

/**
 * Calculates total comments across given videos.
 */
export function calculateTotalComments(videos: Video[]): number {
  return videos.reduce((acc, v) => acc + (v.comments || 0), 0);
}

/**
 * Calculates average views per video.
 */
export function calculateAverageViews(videos: Video[]): number {
  if (videos.length === 0) return 0;
  const total = calculateTotalViews(videos);
  return Math.round(total / videos.length);
}

/**
 * Calculates average likes per video.
 */
export function calculateAverageLikes(videos: Video[]): number {
  if (videos.length === 0) return 0;
  const total = calculateTotalLikes(videos);
  return Math.round(total / videos.length);
}

/**
 * Calculates average comments per video.
 */
export function calculateAverageComments(videos: Video[]): number {
  if (videos.length === 0) return 0;
  const total = calculateTotalComments(videos);
  return Math.round(total / videos.length);
}

/**
 * Calculates average engagement rate across videos.
 */
export function calculateAverageEngagement(videos: Video[]): number {
  if (videos.length === 0) return 0;
  const totalViews = calculateTotalViews(videos);
  const totalInteractions = calculateTotalLikes(videos) + calculateTotalComments(videos);
  return calculateVideoEngagement(totalViews, totalInteractions, 0);
}

/**
 * Aggregates factual performance metrics across all 4 platforms.
 */
export function calculatePlatformMetrics(videos: Video[]): PlatformMetrics[] {
  return ALL_VIDEO_PLATFORMS.map((platform) => {
    const platformVideos = videos.filter((v) => v.platform === platform && v.status === "PUBLISHED");
    const totalViews = calculateTotalViews(platformVideos);
    const totalLikes = calculateTotalLikes(platformVideos);
    const totalComments = calculateTotalComments(platformVideos);

    return {
      platform,
      videos: platformVideos.length,
      views: totalViews,
      averageViews: calculateAverageViews(platformVideos),
      likes: totalLikes,
      comments: totalComments,
      engagementRate: calculateVideoEngagement(totalViews, totalLikes, totalComments),
    };
  });
}

/**
 * Aggregates views and engagement grouped chronologically by publication date.
 */
export function calculateViewsByDate(videos: Video[]): TimeSeriesDataPoint[] {
  const publishedOnly = videos.filter((v) => v.status === "PUBLISHED" && v.publishedAt);

  const dateMap = new Map<string, { views: number; likes: number; comments: number; count: number }>();

  for (const video of publishedOnly) {
    if (!video.publishedAt) continue;
    const dateKey = video.publishedAt.slice(0, 10); // YYYY-MM-DD
    const existing = dateMap.get(dateKey) || { views: 0, likes: 0, comments: 0, count: 0 };
    dateMap.set(dateKey, {
      views: existing.views + (video.views || 0),
      likes: existing.likes + (video.likes || 0),
      comments: existing.comments + (video.comments || 0),
      count: existing.count + 1,
    });
  }

  // Sort chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();

  return sortedDates.map((dateKey) => {
    const data = dateMap.get(dateKey)!;
    const dateObj = new Date(dateKey);
    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const engagement = calculateVideoEngagement(data.views, data.likes, data.comments);

    return {
      date: dateKey,
      label,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      engagementRate: Number(engagement.toFixed(2)),
      videoCount: data.count,
    };
  });
}

/**
 * Returns top published content sorted by views descending.
 */
export function calculateTopContent(videos: Video[], limit?: number): Video[] {
  const sorted = [...videos]
    .filter((v) => v.status === "PUBLISHED")
    .sort((a, b) => (b.views || 0) - (a.views || 0));

  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/**
 * Calculates factual aggregate metrics for characters appearing in published videos.
 */
export function calculateCharacterPerformance(
  videos: Video[],
  characters: Character[]
): CharacterAnalytics[] {
  const published = videos.filter((v) => v.status === "PUBLISHED");

  return characters
    .map((char) => {
      const associatedVideos = published.filter((v) => v.characterIds.includes(char.id));
      const appearances = associatedVideos.length;
      const totalViews = calculateTotalViews(associatedVideos);
      const averageViews = appearances > 0 ? Math.round(totalViews / appearances) : 0;
      const totalLikes = calculateTotalLikes(associatedVideos);
      const totalComments = calculateTotalComments(associatedVideos);
      const engagement = calculateVideoEngagement(totalViews, totalLikes, totalComments);

      return {
        characterId: char.id,
        name: char.name,
        role: char.role,
        avatar: char.avatar || char.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        appearances,
        totalViews,
        averageViews,
        totalLikes,
        totalComments,
        averageEngagementRate: Number(engagement.toFixed(2)),
      };
    })
    .filter((item) => item.appearances > 0)
    .sort((a, b) => b.totalViews - a.totalViews);
}

/**
 * Calculates content performance broken down by Roblox category from linked ideas.
 */
export function calculateCategoryPerformance(
  videos: Video[],
  ideas: IdeaItem[]
): CategoryPerformance[] {
  const published = videos.filter((v) => v.status === "PUBLISHED");
  const ideaMap = new Map<string, IdeaItem>(ideas.map((i) => [i.id, i]));

  const categoryMap = new Map<
    string,
    { count: number; views: number; likes: number; comments: number }
  >();

  for (const video of published) {
    let cat = "Other";
    if (video.ideaId && ideaMap.has(video.ideaId)) {
      cat = ideaMap.get(video.ideaId)!.category;
    }
    const current = categoryMap.get(cat) || { count: 0, views: 0, likes: 0, comments: 0 };
    categoryMap.set(cat, {
      count: current.count + 1,
      views: current.views + (video.views || 0),
      likes: current.likes + (video.likes || 0),
      comments: current.comments + (video.comments || 0),
    });
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => {
    const avgViews = data.count > 0 ? Math.round(data.views / data.count) : 0;
    const engagement = calculateVideoEngagement(data.views, data.likes, data.comments);
    return {
      category,
      videoCount: data.count,
      totalViews: data.views,
      averageViews: avgViews,
      averageEngagementRate: Number(engagement.toFixed(2)),
    };
  });
}

/**
 * Calculates content performance by video format (Short vs Long Video).
 */
export function calculateFormatPerformance(videos: Video[]): FormatPerformance[] {
  const published = videos.filter((v) => v.status === "PUBLISHED");

  const shorts = published.filter(
    (v) =>
      v.platform === "YOUTUBE_SHORTS" ||
      v.platform === "TIKTOK" ||
      v.platform === "INSTAGRAM_REELS" ||
      v.duration <= 60
  );

  const longVideos = published.filter(
    (v) => v.platform === "YOUTUBE" && v.duration > 60
  );

  const results: FormatPerformance[] = [];

  // Shorts
  const shortsViews = calculateTotalViews(shorts);
  const shortsEngagement = calculateVideoEngagement(
    shortsViews,
    calculateTotalLikes(shorts),
    calculateTotalComments(shorts)
  );
  results.push({
    format: "Short",
    videoCount: shorts.length,
    totalViews: shortsViews,
    averageViews: calculateAverageViews(shorts),
    averageEngagementRate: Number(shortsEngagement.toFixed(2)),
  });

  // Long Video
  const longViews = calculateTotalViews(longVideos);
  const longEngagement = calculateVideoEngagement(
    longViews,
    calculateTotalLikes(longVideos),
    calculateTotalComments(longVideos)
  );
  results.push({
    format: "Long Video",
    videoCount: longVideos.length,
    totalViews: longViews,
    averageViews: calculateAverageViews(longVideos),
    averageEngagementRate: Number(longEngagement.toFixed(2)),
  });

  return results;
}

/**
 * Derives publishing activity counts (Published, Scheduled, In Production) across timeline periods.
 */
export function calculatePublishingActivity(
  videos: Video[],
  events: CalendarEvent[]
): PublishingActivityData[] {
  const publishedCount = videos.filter((v) => v.status === "PUBLISHED").length;
  const scheduledCount = videos.filter((v) => v.status === "SCHEDULED").length;
  const inProdCount = videos.filter((v) =>
    ["PLANNING", "IN_PRODUCTION", "EDITING"].includes(v.status)
  ).length;

  return [
    {
      period: "Jul 2026",
      published: videos.filter((v) => v.publishedAt && v.publishedAt.startsWith("2026-07")).length,
      scheduled: 0,
      inProduction: 0,
    },
    {
      period: "Aug 2026",
      published: videos.filter((v) => v.publishedAt && v.publishedAt.startsWith("2026-08")).length,
      scheduled: 0,
      inProduction: 1,
    },
    {
      period: "Sep 2026",
      published: videos.filter((v) => v.publishedAt && v.publishedAt.startsWith("2026-09")).length,
      scheduled: videos.filter((v) => v.scheduledAt && v.scheduledAt.startsWith("2026-09")).length,
      inProduction: inProdCount,
    },
    {
      period: "Oct 2026",
      published: 0,
      scheduled: events.filter((e) => e.scheduledAt.startsWith("2026-10")).length,
      inProduction: 1,
    },
  ];
}

/**
 * Generates factual, evidence-based creator observations strictly derived from dataset math.
 * No speculative or causal claims.
 */
export function calculateCreatorInsights(
  videos: Video[],
  ideas: IdeaItem[],
  characters: Character[]
): CreatorInsight[] {
  const published = videos.filter((v) => v.status === "PUBLISHED");
  const insights: CreatorInsight[] = [];

  if (published.length === 0) {
    return [
      {
        id: "ins-empty",
        type: "neutral",
        title: "Catalog Overview",
        detail: "No published videos are present in the selected timeframe to generate performance insights.",
      },
    ];
  }

  // 1. Shorts distribution insight
  const shortsCount = published.filter(
    (v) =>
      v.platform === "YOUTUBE_SHORTS" ||
      v.platform === "TIKTOK" ||
      v.platform === "INSTAGRAM_REELS" ||
      v.duration <= 60
  ).length;
  const shortsPercent = Math.round((shortsCount / published.length) * 100);
  insights.push({
    id: "ins-shorts",
    type: "info",
    title: "Catalog Format Composition",
    detail: `Short-form videos account for ${shortsPercent}% of your published catalog (${shortsCount} of ${published.length} videos).`,
    stat: `${shortsPercent}%`,
  });

  // 2. Average views for highest platform
  const platforms = calculatePlatformMetrics(published).filter((p) => p.videos > 0);
  if (platforms.length > 0) {
    const highestPlatform = [...platforms].sort((a, b) => b.averageViews - a.averageViews)[0];
    insights.push({
      id: "ins-platform-avg",
      type: "positive",
      title: "Platform Average Performance",
      detail: `Videos published on ${highestPlatform.platform.replace(/_/g, " ")} average ${formatCompactNumber(highestPlatform.averageViews)} views with ${formatPercent(highestPlatform.engagementRate)} engagement.`,
      stat: formatCompactNumber(highestPlatform.averageViews),
    });
  }

  // 3. Category distribution insight
  const categories = calculateCategoryPerformance(published, ideas);
  if (categories.length > 0) {
    const topCat = [...categories].sort((a, b) => b.videoCount - a.videoCount)[0];
    const catPercent = Math.round((topCat.videoCount / published.length) * 100);
    insights.push({
      id: "ins-category",
      type: "neutral",
      title: "Content Category Coverage",
      detail: `${topCat.category}-related content represents ${catPercent}% of published uploads with an average of ${formatCompactNumber(topCat.averageViews)} views.`,
      stat: `${catPercent}%`,
    });
  }

  // 4. Character appearances
  const characterStats = calculateCharacterPerformance(published, characters);
  if (characterStats.length > 0) {
    const leadChar = characterStats[0];
    insights.push({
      id: "ins-character",
      type: "info",
      title: "Featured Character Presence",
      detail: `${leadChar.name} appears in ${leadChar.appearances} published videos totaling ${formatCompactNumber(leadChar.totalViews)} combined views.`,
      stat: `${leadChar.appearances} videos`,
    });
  }

  return insights;
}
