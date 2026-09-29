import { getVideos } from "./videos";
import { getIdeas } from "./ideas";
import { getCharacters } from "./characters";
import { getCalendarEvents } from "./calendar";
import {
  calculateCategoryPerformance,
  calculateCharacterPerformance,
  calculateCreatorInsights,
  calculateFormatPerformance,
  calculatePlatformMetrics,
  calculatePublishingActivity,
  calculateTopContent,
  calculateViewsByDate,
  filterAnalyticsDataset,
  calculateTotalViews,
  calculateAverageViews,
  calculateAverageEngagement,
} from "../analytics-utils";
import { AnalyticsFilterOptions } from "../analytics-utils";

export interface AnalyticsSummaryMetrics {
  totalViews: number;
  averageViews: number;
  averageEngagement: number;
  videoCount: number;
}
import {
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
} from "../types";

export interface AnalyticsWorkspaceData {
  videos: Video[];
  ideas: IdeaItem[];
  characters: Character[];
  calendarEvents: CalendarEvent[];
}

export interface ComputedAnalyticsPayload {
  filteredVideos: Video[];
  summary: AnalyticsSummaryMetrics;
  timeSeries: TimeSeriesDataPoint[];
  platformMetrics: PlatformMetrics[];
  topContent: Video[];
  categoryPerformance: CategoryPerformance[];
  characterPerformance: CharacterAnalytics[];
  formatPerformance: FormatPerformance[];
  publishingActivity: PublishingActivityData[];
  insights: CreatorInsight[];
}

/**
 * Loads all workspace records from PostgreSQL and evaluates the analytics engine.
 */
export async function getAnalyticsData(
  options?: AnalyticsFilterOptions,
  userId?: string
): Promise<ComputedAnalyticsPayload> {
  const [videos, ideas, characters, calendarEvents] = await Promise.all([
    getVideos(userId),
    getIdeas(userId),
    getCharacters(userId),
    getCalendarEvents(userId),
  ]);

  const filteredVideos = filterAnalyticsDataset(videos, options);

  const totalViews = calculateTotalViews(filteredVideos);
  const averageViews = calculateAverageViews(filteredVideos);
  const averageEngagement = calculateAverageEngagement(filteredVideos);

  const timeSeries = calculateViewsByDate(filteredVideos);
  const platformMetrics = calculatePlatformMetrics(filteredVideos);
  const topContent = calculateTopContent(filteredVideos, 5);
  const categoryPerformance = calculateCategoryPerformance(filteredVideos, ideas);
  const characterPerformance = calculateCharacterPerformance(filteredVideos, characters);
  const formatPerformance = calculateFormatPerformance(filteredVideos);
  const publishingActivity = calculatePublishingActivity(videos, calendarEvents);
  const insights = calculateCreatorInsights(videos, ideas, characters);

  return {
    filteredVideos,
    summary: {
      totalViews,
      averageViews,
      averageEngagement,
      videoCount: filteredVideos.length,
    },
    timeSeries,
    platformMetrics,
    topContent,
    categoryPerformance,
    characterPerformance,
    formatPerformance,
    publishingActivity,
    insights,
  };
}
