"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Eye,
  Film,
  Heart,
  MessageCircle,
  MoreVertical,
  Play,
  Share2,
  Trash2,
  Edit,
  Sparkles,
  Layers,
  Lightbulb,
} from "lucide-react";
import { Character, Video } from "@/lib/types";
import {
  PLATFORM_CONFIG,
  VIDEO_STATUS_CONFIG,
  VIDEO_STATUS_LABELS,
} from "@/lib/constants";
import { formatDuration, formatMetric, formatDate } from "@/lib/video-calendar-utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  characters?: Character[];
  onSelect: (video: Video) => void;
  onEdit: (video: Video) => void;
  onSchedule?: (video: Video) => void;
  onDelete: (video: Video) => void;
}

export function VideoCard({
  video,
  characters = [],
  onSelect,
  onEdit,
  onSchedule,
  onDelete,
}: VideoCardProps) {
  const platform = PLATFORM_CONFIG[video.platform] || PLATFORM_CONFIG.YOUTUBE;
  const statusCfg = VIDEO_STATUS_CONFIG[video.status] || VIDEO_STATUS_CONFIG.PLANNING;

  // Resolve characters assigned to this video
  const cast = video.characterIds
    .map((id) => characters.find((c) => c.id === id))
    .filter((c): c is Character => Boolean(c));

  return (
    <div className="group flex flex-col rounded-2xl bg-surface-panel/90 border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-violet-950/20 overflow-hidden">
      {/* Thumbnail Header */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-surface-canvas cursor-pointer"
        onClick={() => onSelect(video)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas/90 via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-white text-white" />
          </div>
        </div>

        {/* Top-left: Platform Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md uppercase tracking-wider",
              platform.badge
            )}
          >
            {platform.label}
          </span>
        </div>

        {/* Top-right: Status Pill */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1.5",
              statusCfg.bg,
              statusCfg.text,
              "border-white/10"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>

        {/* Bottom-right: Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/10 flex items-center gap-1 backdrop-blur-sm">
            <Clock className="w-3 h-3 text-slate-300" />
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Bottom-left: Workflow provenance flags */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
          {video.scriptId && (
            <span
              title="Linked to Script"
              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30 flex items-center gap-0.5 backdrop-blur-sm"
            >
              <Film className="w-2.5 h-2.5" />
              Script
            </span>
          )}
          {video.ideaId && (
            <span
              title="Originated from Idea"
              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 backdrop-blur-sm"
            >
              <Lightbulb className="w-2.5 h-2.5" />
              Idea
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h4
            onClick={() => onSelect(video)}
            className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors cursor-pointer line-clamp-2"
          >
            {video.title}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2">
            {video.description || "No description provided."}
          </p>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Cast Preview */}
        {cast.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Cast:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {cast.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  title={`${member.name} (${member.role})`}
                  className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-white/20 bg-surface-elevated shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.avatar || member.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {cast.length > 4 && (
                <div className="w-5 h-5 rounded-full bg-surface-elevated ring-1 ring-white/20 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                  +{cast.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer: Metrics or Scheduling info */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          {video.status === "PUBLISHED" ? (
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {formatMetric(video.views)}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                {formatMetric(video.likes)}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <MessageCircle className="w-3.5 h-3.5 text-violet-400" />
                {formatMetric(video.comments)}
              </span>
            </div>
          ) : video.status === "SCHEDULED" && video.scheduledAt ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatDate(video.scheduledAt)}</span>
            </div>
          ) : video.status === "READY" ? (
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ready for upload</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Film className="w-3.5 h-3.5 text-slate-500" />
              <span>{VIDEO_STATUS_LABELS[video.status]}</span>
            </div>
          )}

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1">
            {video.status !== "PUBLISHED" && onSchedule && (
              <Button
                variant="ghost"
                size="icon"
                title="Schedule Video"
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => onSchedule(video)}
              >
                <Calendar className="w-3.5 h-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              title="Edit Video"
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => onEdit(video)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Delete Video"
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              onClick={() => onDelete(video)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
