"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Layers,
  MessageCircle,
  Percent,
  Sparkles,
  TrendingUp,
  Video as VideoIcon,
} from "lucide-react";
import {
  AnalyticsTimeRange,
  CalendarEvent,
  Character,
  IdeaItem,
  Script,
  Video,
  VideoPlatform,
} from "@/lib/types";
import {
  ALL_ANALYTICS_TIME_RANGES,
  ALL_VIDEO_PLATFORMS,
  PLATFORM_CONFIG,
  TIME_RANGE_LABELS,
} from "@/lib/constants";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import { INITIAL_CHARACTERS } from "@/lib/mock-characters";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import { INITIAL_CALENDAR_EVENTS } from "@/lib/mock-calendar";
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
  calculateViewsByDate,
  filterAnalyticsDataset,
  formatCompactNumber,
  formatNumber,
  formatPercent,
  MOCK_ANALYTICS_REFERENCE_DATE,
} from "@/lib/analytics-utils";
import { AnalyticsKpiCard } from "@/components/analytics/AnalyticsKpiCard";
import { ViewsChart } from "@/components/analytics/ViewsChart";
import { EngagementChart } from "@/components/analytics/EngagementChart";
import { PlatformBreakdown } from "@/components/analytics/PlatformBreakdown";
import { TopContentTable } from "@/components/analytics/TopContentTable";
import { ContentPerformance } from "@/components/analytics/ContentPerformance";
import { CharacterPerformance } from "@/components/analytics/CharacterPerformance";
import { CreatorInsights } from "@/components/analytics/CreatorInsights";
import { PublishingActivity } from "@/components/analytics/PublishingActivity";
import { VideoDetailsModal } from "@/components/videos/VideoDetailsModal";
import { cn } from "@/lib/utils";
import { fetchVideosAction } from "@/app/actions/videos";
import { fetchCharactersAction } from "@/app/actions/characters";
import { fetchIdeasAction } from "@/app/actions/ideas";
import { fetchCalendarEventsAction } from "@/app/actions/calendar";
import { fetchScriptsAction } from "@/app/actions/scripts";

function AnalyticsContent() {
  const searchParams = useSearchParams();

  // Primary Data Sources
  const [videos, setVideos] = React.useState<Video[]>(INITIAL_VIDEOS);
  const [characters, setCharacters] = React.useState<Character[]>(INITIAL_CHARACTERS);
  const [ideas, setIdeas] = React.useState<IdeaItem[]>(INITIAL_IDEAS);
  const [scripts, setScripts] = React.useState<Script[]>(INITIAL_SCRIPTS);
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Load from persistent storage on mount
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [vidRes, charRes, ideaRes, scriptRes, calRes] = await Promise.all([
        fetchVideosAction(),
        fetchCharactersAction(),
        fetchIdeasAction(),
        fetchScriptsAction(),
        fetchCalendarEventsAction(),
      ]);
      if (mounted) {
        if (vidRes.success) setVideos(vidRes.data);
        if (charRes.success) setCharacters(charRes.data);
        if (ideaRes.success) setIdeas(ideaRes.data);
        if (scriptRes.success) setScripts(scriptRes.data);
        if (calRes.success) setEvents(calRes.data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filters State
  const [timeRange, setTimeRange] = React.useState<AnalyticsTimeRange>("ALL");
  const [selectedPlatform, setSelectedPlatform] = React.useState<VideoPlatform | "ALL">("ALL");

  // Video dossier inspection modal
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);

  // Initialize filters from URL params if present
  React.useEffect(() => {
    const paramRange = searchParams.get("range");
    if (paramRange && (ALL_ANALYTICS_TIME_RANGES as readonly string[]).includes(paramRange)) {
      setTimeRange(paramRange as AnalyticsTimeRange);
    }
    const paramPlatform = searchParams.get("platform");
    if (paramPlatform && (ALL_VIDEO_PLATFORMS as readonly string[]).includes(paramPlatform)) {
      setSelectedPlatform(paramPlatform as VideoPlatform);
    }
    const paramVideoId = searchParams.get("videoId");
    if (paramVideoId) {
      const matched = videos.find((v) => v.id === paramVideoId);
      if (matched) setSelectedVideo(matched);
    }
  }, [searchParams, videos]);

  // Unified Filtered Dataset
  const filteredVideos = React.useMemo(() => {
    return filterAnalyticsDataset(videos, {
      timeRange,
      platform: selectedPlatform,
      referenceDate: MOCK_ANALYTICS_REFERENCE_DATE,
    });
  }, [videos, timeRange, selectedPlatform]);

  // Derived Core Metrics
  const totalViews = React.useMemo(() => calculateTotalViews(filteredVideos), [filteredVideos]);
  const averageViews = React.useMemo(() => calculateAverageViews(filteredVideos), [filteredVideos]);
  const averageEngagement = React.useMemo(
    () => calculateAverageEngagement(filteredVideos),
    [filteredVideos]
  );
  const totalLikes = React.useMemo(() => calculateTotalLikes(filteredVideos), [filteredVideos]);
  const totalComments = React.useMemo(() => calculateTotalComments(filteredVideos), [filteredVideos]);

  // Multi-Channel Platform Metrics
  const platformMetrics = React.useMemo(
    () => calculatePlatformMetrics(filteredVideos),
    [filteredVideos]
  );

  // Time-Series Chart Data
  const timeSeriesData = React.useMemo(
    () => calculateViewsByDate(filteredVideos),
    [filteredVideos]
  );

  // Top Content Leaderboard
  const topContent = React.useMemo(() => calculateTopContent(filteredVideos), [filteredVideos]);

  // Content Segments Breakdown
  const categoryStats = React.useMemo(
    () => calculateCategoryPerformance(filteredVideos, ideas),
    [filteredVideos, ideas]
  );
  const formatStats = React.useMemo(
    () => calculateFormatPerformance(filteredVideos),
    [filteredVideos]
  );

  // Character Performance Breakdown
  const characterStats = React.useMemo(
    () => calculateCharacterPerformance(filteredVideos, characters),
    [filteredVideos, characters]
  );

  // Publishing Cadence Activity
  const activityData = React.useMemo(
    () => calculatePublishingActivity(videos, events),
    [videos, events]
  );

  // Evidence-Based Creator Observations
  const insights = React.useMemo(
    () => calculateCreatorInsights(filteredVideos, ideas, characters),
    [filteredVideos, ideas, characters]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Analytics Page Header & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Content Analytics
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Creator Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Factual performance metrics, audience engagement curves, and catalog benchmarks.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 p-1.5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08]">
          {/* Time Range Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-surface-canvas border border-white/5">
            {ALL_ANALYTICS_TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  timeRange === range
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {TIME_RANGE_LABELS[range]}
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <div className="w-40 sm:w-44">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as VideoPlatform | "ALL")}
              aria-label="Filter analytics by platform"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Platforms</option>
              {ALL_VIDEO_PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {PLATFORM_CONFIG[plat].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsKpiCard
          label="Total Views"
          value={formatCompactNumber(totalViews)}
          secondaryMetric={`${formatNumber(totalViews)} exact views`}
          icon={Eye}
          accentColor="cyan"
          trend={{
            value: `${filteredVideos.length} uploads`,
            isNeutral: true,
          }}
        />

        <AnalyticsKpiCard
          label="Average Views"
          value={formatCompactNumber(averageViews)}
          secondaryMetric="Baseline per published video"
          icon={TrendingUp}
          accentColor="violet"
        />

        <AnalyticsKpiCard
          label="Engagement Rate"
          value={formatPercent(averageEngagement)}
          secondaryMetric={`${formatCompactNumber(totalLikes)} likes • ${formatCompactNumber(totalComments)} comments`}
          icon={Percent}
          accentColor="emerald"
        />

        <AnalyticsKpiCard
          label="Published Videos"
          value={filteredVideos.length.toString()}
          secondaryMetric={`In selected ${TIME_RANGE_LABELS[timeRange]}`}
          icon={VideoIcon}
          accentColor="amber"
        />
      </div>

      {/* Charts Section: Views Over Time & Engagement Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsChart
          data={timeSeriesData}
          title="Views Over Time"
          timeRangeLabel={TIME_RANGE_LABELS[timeRange]}
        />

        <EngagementChart
          data={timeSeriesData}
          averageEngagementRate={averageEngagement}
          title="Engagement Rate Over Time (%)"
        />
      </div>

      {/* Multi-Channel Platform Breakdown */}
      <PlatformBreakdown metrics={platformMetrics} />

      {/* Publishing Pipeline Activity */}
      <PublishingActivity activityData={activityData} />

      {/* Top Content Leaderboard */}
      <TopContentTable
        videos={topContent}
        onSelectVideo={(v) => setSelectedVideo(v)}
      />

      {/* Content Segments: Categories, Formats, Durations */}
      <ContentPerformance
        categories={categoryStats}
        formats={formatStats}
        videos={filteredVideos}
      />

      {/* Character Performance & Creator Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CharacterPerformance characters={characterStats} />
        <CreatorInsights insights={insights} />
      </div>

      {/* Video Details Modal (from clicking Top Content or query) */}
      <VideoDetailsModal
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
        characters={characters}
        scripts={scripts}
        ideas={ideas}
        onEdit={() => {}}
        onSchedule={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-medium">
          Loading Content Analytics...
        </div>
      }
    >
      <AnalyticsContent />
    </React.Suspense>
  );
}
