"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Video as VideoIcon,
  FileText,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ArrowRight,
  Film,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Play,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEFAULT_CREATOR, PLATFORM_CONFIG } from "@/lib/constants";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import { INITIAL_CALENDAR_EVENTS } from "@/lib/mock-calendar";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import {
  formatDate,
  formatDuration,
  formatMetric,
  formatTime,
  getUpcomingEvents,
} from "@/lib/video-calendar-utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [videos] = React.useState(INITIAL_VIDEOS);
  const [events] = React.useState(INITIAL_CALENDAR_EVENTS);
  const [scripts] = React.useState(INITIAL_SCRIPTS);
  const [ideas] = React.useState(INITIAL_IDEAS);

  // Workflow pipeline counts
  const ideasCount = ideas.length;
  const scriptsCount = scripts.length;
  const inProdVideosCount = videos.filter((v) =>
    ["PLANNING", "IN_PRODUCTION", "EDITING"].includes(v.status)
  ).length;
  const scheduledCount = videos.filter((v) => v.status === "SCHEDULED").length;
  const publishedCount = videos.filter((v) => v.status === "PUBLISHED").length;

  // Aggregate metrics
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);

  // Upcoming content
  const upcomingContent = getUpcomingEvents(events, 4);

  // Recent published showcase
  const publishedVideos = videos
    .filter((v) => v.status === "PUBLISHED")
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-violet-950/40 via-surface-panel to-indigo-950/30">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">
                ROXIE HUB • Creator OS
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Phase 4 Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                {DEFAULT_CREATOR.name}
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Your Roblox content engine is running: 10 video assets in catalog, 5 screenplays in studio, and 14-day upload consistency.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-surface-elevated/80 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Consistency Streak
                </p>
                <p className="text-sm font-extrabold text-white">
                  {DEFAULT_CREATOR.streakDays} Days Consistent 🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Pipeline Navigation Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Creator Pipeline Stage
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Idea → Script → Video → Calendar → Published
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link href="/ideas" className="group">
            <div className="p-3.5 rounded-2xl bg-surface-panel/80 border border-white/5 group-hover:border-amber-500/40 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  1. Ideas Hub
                </span>
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{ideasCount}</p>
              <span className="text-[10px] text-slate-500 group-hover:text-amber-300 transition-colors flex items-center gap-0.5">
                Manage ideas <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          <Link href="/scripts" className="group">
            <div className="p-3.5 rounded-2xl bg-surface-panel/80 border border-white/5 group-hover:border-purple-500/40 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  2. Scripts
                </span>
                <FileText className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{scriptsCount}</p>
              <span className="text-[10px] text-slate-500 group-hover:text-purple-300 transition-colors flex items-center gap-0.5">
                Screenplays <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          <Link href="/videos" className="group">
            <div className="p-3.5 rounded-2xl bg-surface-panel/80 border border-white/5 group-hover:border-violet-500/40 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  3. In Production
                </span>
                <Film className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{inProdVideosCount}</p>
              <span className="text-[10px] text-slate-500 group-hover:text-violet-300 transition-colors flex items-center gap-0.5">
                Video studio <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          <Link href="/calendar" className="group">
            <div className="p-3.5 rounded-2xl bg-surface-panel/80 border border-white/5 group-hover:border-cyan-500/40 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  4. Scheduled
                </span>
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{scheduledCount}</p>
              <span className="text-[10px] text-slate-500 group-hover:text-cyan-300 transition-colors flex items-center gap-0.5">
                Content calendar <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          <Link href="/videos?status=PUBLISHED" className="group col-span-2 sm:col-span-1">
            <div className="p-3.5 rounded-2xl bg-surface-panel/80 border border-white/5 group-hover:border-emerald-500/40 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  5. Published
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{publishedCount}</p>
              <span className="text-[10px] text-slate-500 group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                Catalog views <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Upcoming Content Drop Schedule & Top Published Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Releases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Upcoming Upload Schedule
              </h3>
            </div>
            <Link
              href="/calendar"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingContent.map((item) => {
              const platformCfg =
                PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.YOUTUBE;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/5 flex items-center justify-between gap-3 hover:border-violet-500/30 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                          platformCfg.badge
                        )}
                      >
                        {platformCfg.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDate(item.scheduledAt, { month: "short", day: "numeric" })},{" "}
                        {formatTime(item.scheduledAt)}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white truncate">
                      {item.title}
                    </h5>

                    {item.notes && (
                      <p className="text-[10px] text-slate-400 truncate">{item.notes}</p>
                    )}
                  </div>

                  <Link href={`/calendar`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 shrink-0">
                      View
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Published Video Highlights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Performing Releases
              </h3>
            </div>
            <Link
              href="/videos"
              className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1"
            >
              <span>Video Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {publishedVideos.slice(0, 2).map((vid) => {
              const platformCfg =
                PLATFORM_CONFIG[vid.platform] || PLATFORM_CONFIG.YOUTUBE;

              return (
                <div
                  key={vid.id}
                  className="p-3.5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 hover:border-violet-500/30 transition-all"
                >
                  <div className="relative w-full sm:w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/80 text-white">
                      {formatDuration(vid.duration)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                          platformCfg.badge
                        )}
                      >
                        {platformCfg.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(vid.publishedAt || vid.createdAt)}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white truncate">{vid.title}</h5>

                    <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        {formatMetric(vid.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {formatMetric(vid.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-violet-400" />
                        {formatMetric(vid.comments)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/videos?videoId=${vid.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 shrink-0">
                      Inspect
                    </Button>
                  </Link>
                </div>
              );
            })}

            {/* Quick aggregate performance strip */}
            <div className="p-3.5 rounded-2xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Combined Channel Reach
              </span>
              <span className="text-white font-mono font-bold">
                {formatMetric(totalViews)} Views • {formatMetric(totalLikes)} Likes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
