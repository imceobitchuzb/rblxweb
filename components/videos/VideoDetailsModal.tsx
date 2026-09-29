"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Film,
  Heart,
  Lightbulb,
  MessageCircle,
  Play,
  Share2,
  Trash2,
  Users,
  Edit,
  TrendingUp,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Character, IdeaItem, Script, Video } from "@/lib/types";
import {
  PLATFORM_CONFIG,
  ROLE_CONFIG,
  VIDEO_STATUS_CONFIG,
  VIDEO_STATUS_LABELS,
} from "@/lib/constants";
import {
  formatDate,
  formatDuration,
  formatMetric,
  formatTime,
} from "@/lib/video-calendar-utils";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface VideoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  characters?: Character[];
  scripts?: Script[];
  ideas?: IdeaItem[];
  onEdit: (video: Video) => void;
  onSchedule: (video: Video) => void;
  onDelete: (video: Video) => void;
}

export function VideoDetailsModal({
  isOpen,
  onClose,
  video,
  characters = [],
  scripts = [],
  ideas = [],
  onEdit,
  onSchedule,
  onDelete,
}: VideoDetailsModalProps) {
  if (!video) return null;

  const platform = PLATFORM_CONFIG[video.platform] || PLATFORM_CONFIG.YOUTUBE;
  const statusCfg = VIDEO_STATUS_CONFIG[video.status] || VIDEO_STATUS_CONFIG.PLANNING;

  // Resolve linked cast
  const cast = video.characterIds
    .map((id) => characters.find((c) => c.id === id))
    .filter((c): c is Character => Boolean(c));

  // Resolve linked script & idea
  const linkedScript = video.scriptId
    ? scripts.find((s) => s.id === video.scriptId)
    : undefined;

  const linkedIdea = video.ideaId
    ? ideas.find((i) => i.id === video.ideaId)
    : undefined;

  // Engagement calculation
  const totalInteractions = (video.likes || 0) + (video.comments || 0);
  const engagementRate =
    video.views && video.views > 0
      ? ((totalInteractions / video.views) * 100).toFixed(2)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
              platform.badge
            )}
          >
            {platform.label}
          </span>
          <span className="text-white font-bold truncate max-w-md">{video.title}</span>
        </div>
      }
      description={`ID: ${video.id} • Created ${formatDate(video.createdAt)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Media Player Showcase Header */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/80 border border-white/10 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-6 h-6 ml-0.5 fill-white" />
            </div>
          </div>

          {/* Bottom Video HUD */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5",
                statusCfg.bg,
                statusCfg.text,
                "border-white/10"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusCfg.dot)} />
              {statusCfg.label}
            </span>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-black/80 text-white border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-slate-300" />
              {formatDuration(video.duration)}
            </span>
          </div>
        </div>

        {/* Performance Metrics Stats Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Performance Metrics
            </span>
            <Link
              href={`/analytics?videoId=${video.id}`}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View Channel Analytics</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Views
            </span>
            <p className="text-xl font-black text-white font-mono">
              {formatMetric(video.views || 0)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Likes
            </span>
            <p className="text-xl font-black text-white font-mono">
              {formatMetric(video.likes || 0)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-violet-400" />
              Comments
            </span>
            <p className="text-xl font-black text-white font-mono">
              {formatMetric(video.comments || 0)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Engagement
            </span>
            <p className="text-xl font-black text-white font-mono">
              {engagementRate ? `${engagementRate}%` : "—"}
            </p>
          </div>
        </div>
      </div>

        {/* Video Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Description & Notes
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-surface-canvas/40 p-3 rounded-xl border border-white/5">
            {video.description || "No description provided for this video asset."}
          </p>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-surface-canvas text-slate-300 border border-white/5 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roblox Cast Assigned */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Assigned Characters ({cast.length})
            </h4>
            <Link
              href="/characters"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Manage in Roster</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {cast.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-surface-canvas/30 border border-white/5">
              No Roblox characters assigned to this video yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cast.map((char) => {
                const roleCfg = ROLE_CONFIG[char.role] || ROLE_CONFIG.NPC;
                return (
                  <div
                    key={char.id}
                    className="p-2.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-elevated ring-1 ring-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={char.avatar || char.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {char.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {char.personality}
                        </p>
                      </div>
                    </div>
                    <Badge variant={roleCfg.badgeVariant} size="sm">
                      {roleCfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Creator Workflow Provenance Pipeline */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Workflow Lineage (Idea → Script → Video)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Linked Script */}
            <div className="p-3 rounded-xl bg-surface-canvas/60 border border-white/5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-violet-400 uppercase flex items-center gap-1">
                  <Film className="w-3 h-3" />
                  Screenplay Source
                </span>
                {linkedScript ? (
                  <div className="mt-1">
                    <p className="text-xs font-bold text-white truncate">
                      {linkedScript.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                      &quot;{linkedScript.hook}&quot;
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Created without an associated script
                  </p>
                )}
              </div>

              {linkedScript && (
                <Link
                  href={`/scripts?scriptId=${linkedScript.id}`}
                  className="text-xs text-violet-300 hover:text-violet-200 font-semibold flex items-center gap-1 pt-1"
                >
                  <span>Open Script Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Linked Idea */}
            <div className="p-3 rounded-xl bg-surface-canvas/60 border border-white/5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Origin Idea
                </span>
                {linkedIdea ? (
                  <div className="mt-1">
                    <p className="text-xs font-bold text-white truncate">
                      {linkedIdea.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Category: {linkedIdea.category} • Score: {linkedIdea.potentialScore}/10
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Independent project concept
                  </p>
                )}
              </div>

              {linkedIdea && (
                <Link
                  href={`/ideas?search=${encodeURIComponent(linkedIdea.title)}`}
                  className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 pt-1"
                >
                  <span>View in Ideas Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scheduling Details if scheduled */}
        {video.scheduledAt && (
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-indigo-200 block">
                  Scheduled for Upload
                </span>
                <span className="text-[11px] text-slate-300">
                  {formatDate(video.scheduledAt)} at {formatTime(video.scheduledAt)}
                </span>
              </div>
            </div>

            <Link
              href="/calendar"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            onClick={() => {
              onClose();
              onDelete(video);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Video
          </Button>

          <div className="flex items-center gap-2">
            <Link href={`/analytics?videoId=${video.id}`} onClick={onClose}>
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/10"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" />
                View Analytics
              </Button>
            </Link>

            {video.status !== "PUBLISHED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onSchedule(video);
                }}
              >
                <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Schedule
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(video);
              }}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit Video
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
