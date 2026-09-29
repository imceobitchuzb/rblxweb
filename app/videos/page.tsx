"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Video as VideoIcon,
  Plus,
  Search,
  Filter,
  X,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  Film,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  Character,
  IdeaItem,
  Script,
  Video,
  VideoPlatform,
  VideoStatus,
  CalendarEvent,
} from "@/lib/types";
import {
  ALL_VIDEO_PLATFORMS,
  ALL_VIDEO_STATUSES,
  PLATFORM_CONFIG,
  VIDEO_STATUS_CONFIG,
  VIDEO_STATUS_LABELS,
} from "@/lib/constants";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import { INITIAL_CHARACTERS } from "@/lib/mock-characters";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import {
  createVideoFromScript,
  filterVideos,
  formatMetric,
} from "@/lib/video-calendar-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoModal } from "@/components/videos/VideoModal";
import { VideoDetailsModal } from "@/components/videos/VideoDetailsModal";
import { ScheduleVideoModal } from "@/components/videos/ScheduleVideoModal";
import { DeleteVideoDialog } from "@/components/videos/DeleteVideoDialog";
import { cn } from "@/lib/utils";

function VideosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [videos, setVideos] = React.useState<Video[]>(INITIAL_VIDEOS);
  const [characters] = React.useState<Character[]>(INITIAL_CHARACTERS);
  const [scripts] = React.useState<Script[]>(INITIAL_SCRIPTS);
  const [ideas] = React.useState<IdeaItem[]>(INITIAL_IDEAS);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState<VideoPlatform | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<VideoStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = React.useState<"date" | "views" | "duration" | "title">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<Video | null>(null);
  const [detailsVideo, setDetailsVideo] = React.useState<Video | null>(null);
  const [schedulingVideo, setSchedulingVideo] = React.useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = React.useState<Video | null>(null);

  // Prefill initial data for create modal (e.g. from script)
  const [prefilledVideo, setPrefilledVideo] = React.useState<Partial<Video> | null>(null);

  // Handle URL query parameters (e.g. ?createFromScript=script-1 or ?videoId=vid-1)
  React.useEffect(() => {
    const fromScriptId = searchParams.get("createFromScript");
    if (fromScriptId) {
      const targetScript = scripts.find((s) => s.id === fromScriptId);
      if (targetScript) {
        const scaffold = createVideoFromScript(targetScript);
        setPrefilledVideo(scaffold);
        setIsCreateOpen(true);
      }
    }

    const openVideoId = searchParams.get("videoId");
    if (openVideoId) {
      const targetVideo = videos.find((v) => v.id === openVideoId);
      if (targetVideo) {
        setDetailsVideo(targetVideo);
      }
    }
  }, [searchParams, scripts, videos]);

  // Filtered and sorted videos
  const filteredVideos = React.useMemo(() => {
    return filterVideos(videos, {
      search: searchTerm,
      platform: selectedPlatform,
      status: selectedStatus,
      sortBy,
      sortOrder,
    });
  }, [videos, searchTerm, selectedPlatform, selectedStatus, sortBy, sortOrder]);

  // Aggregate KPI metrics
  const totalViews = React.useMemo(
    () => videos.reduce((acc, v) => acc + (v.views || 0), 0),
    [videos]
  );
  const inPipelineCount = React.useMemo(
    () => videos.filter((v) => ["PLANNING", "IN_PRODUCTION", "EDITING"].includes(v.status)).length,
    [videos]
  );
  const scheduledCount = React.useMemo(
    () => videos.filter((v) => ["READY", "SCHEDULED"].includes(v.status)).length,
    [videos]
  );

  // Handlers
  const handleSaveVideo = (videoData: Partial<Video>) => {
    if (videoData.id) {
      // Update existing video
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoData.id
            ? { ...v, ...(videoData as Video), updatedAt: new Date().toISOString() }
            : v
        )
      );
      if (detailsVideo && detailsVideo.id === videoData.id) {
        setDetailsVideo((prev) => (prev ? { ...prev, ...(videoData as Video) } : null));
      }
    } else {
      // Create new video
      const newVideo: Video = {
        id: `vid-${Date.now()}`,
        title: videoData.title || "Untitled Video",
        description: videoData.description || "",
        platform: videoData.platform || "YOUTUBE_SHORTS",
        status: videoData.status || "PLANNING",
        duration: videoData.duration || 60,
        thumbnail:
          videoData.thumbnail ||
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
        scriptId: videoData.scriptId,
        ideaId: videoData.ideaId,
        characterIds: videoData.characterIds || [],
        tags: videoData.tags || [],
        views: videoData.views || 0,
        likes: videoData.likes || 0,
        comments: videoData.comments || 0,
        scheduledAt: videoData.scheduledAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVideos((prev) => [newVideo, ...prev]);
    }
    setPrefilledVideo(null);
  };

  const handleConfirmSchedule = (updatedVideo: Video, calendarEvent: CalendarEvent) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === updatedVideo.id ? updatedVideo : v))
    );
    if (detailsVideo && detailsVideo.id === updatedVideo.id) {
      setDetailsVideo(updatedVideo);
    }
  };

  const handleDeleteVideo = (video: Video) => {
    setVideos((prev) => prev.filter((v) => v.id !== video.id));
    if (detailsVideo && detailsVideo.id === video.id) {
      setDetailsVideo(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPlatform("ALL");
    setSelectedStatus("ALL");
    setSortBy("date");
    setSortOrder("desc");
  };

  const isFiltered =
    searchTerm !== "" ||
    selectedPlatform !== "ALL" ||
    selectedStatus !== "ALL" ||
    sortBy !== "date";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Video Studio
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 uppercase tracking-wider">
              Phase 4 Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Produce, package, and distribute Roblox content across YouTube, Shorts, TikTok, and Reels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPrefilledVideo(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Video Asset</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <VideoIcon className="w-3.5 h-3.5 text-violet-400" />
            Total Videos
          </span>
          <p className="text-2xl font-black text-white font-mono">{videos.length}</p>
          <span className="text-[10px] text-slate-500">Across 4 platforms</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            In Production
          </span>
          <p className="text-2xl font-black text-white font-mono">{inPipelineCount}</p>
          <span className="text-[10px] text-slate-500">Planning & editing</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Ready / Scheduled
          </span>
          <p className="text-2xl font-black text-white font-mono">{scheduledCount}</p>
          <span className="text-[10px] text-slate-500">Queued for release</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Combined Views
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {formatMetric(totalViews)}
          </p>
          <span className="text-[10px] text-slate-500">Published catalog</span>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or #tag..."
              className="pl-9 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Platform Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as VideoPlatform | "ALL")}
              aria-label="Filter by Platform"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Platforms</option>
              {ALL_VIDEO_PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {PLATFORM_CONFIG[plat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as VideoStatus | "ALL")}
              aria-label="Filter by Status"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">All Statuses</option>
              {ALL_VIDEO_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {VIDEO_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full md:w-44 flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "views" | "duration" | "title")
              }
              aria-label="Sort videos by"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
            >
              <option value="date">Sort: Date</option>
              <option value="views">Sort: Views</option>
              <option value="duration">Sort: Duration</option>
              <option value="title">Sort: Title</option>
            </select>

            <Button
              variant="outline"
              size="icon"
              title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="w-9 h-9 shrink-0 rounded-xl"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400">Active Filters:</span>
              {searchTerm && (
                <span className="px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 text-[10px]">
                  &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedPlatform !== "ALL" && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                  {PLATFORM_CONFIG[selectedPlatform].label}
                </span>
              )}
              {selectedStatus !== "ALL" && (
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px]">
                  {VIDEO_STATUS_LABELS[selectedStatus]}
                </span>
              )}
              {sortBy !== "date" && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px]">
                  Sort: {sortBy} ({sortOrder})
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors shrink-0"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Video Gallery Grid */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No videos match your criteria"
          description="Try relaxing your platform or status filters, or create a new video asset."
          actionLabel={isFiltered ? "Reset Filters" : "Create Video"}
          onAction={isFiltered ? handleResetFilters : () => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              characters={characters}
              onSelect={(v) => setDetailsVideo(v)}
              onEdit={(v) => setEditingVideo(v)}
              onSchedule={(v) => setSchedulingVideo(v)}
              onDelete={(v) => setDeletingVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <VideoModal
        isOpen={isCreateOpen || Boolean(editingVideo)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingVideo(null);
          setPrefilledVideo(null);
        }}
        onSubmit={handleSaveVideo}
        initialData={editingVideo || (prefilledVideo as Video | null)}
        characters={characters}
        scripts={scripts}
      />

      {/* Video Details Dossier Modal */}
      <VideoDetailsModal
        isOpen={Boolean(detailsVideo)}
        onClose={() => setDetailsVideo(null)}
        video={detailsVideo}
        characters={characters}
        scripts={scripts}
        ideas={ideas}
        onEdit={(v) => {
          setDetailsVideo(null);
          setEditingVideo(v);
        }}
        onSchedule={(v) => {
          setDetailsVideo(null);
          setSchedulingVideo(v);
        }}
        onDelete={(v) => {
          setDetailsVideo(null);
          setDeletingVideo(v);
        }}
      />

      {/* Schedule Video Modal */}
      <ScheduleVideoModal
        isOpen={Boolean(schedulingVideo)}
        onClose={() => setSchedulingVideo(null)}
        video={schedulingVideo}
        onConfirmSchedule={handleConfirmSchedule}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteVideoDialog
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        video={deletingVideo}
        onConfirm={handleDeleteVideo}
      />
    </div>
  );
}

export default function VideosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-medium">
          Loading Video Studio...
        </div>
      }
    >
      <VideosContent />
    </React.Suspense>
  );
}
