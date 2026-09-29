"use client";

import * as React from "react";
import { Film, Eye, Heart, MessageCircle, ChevronDown, ChevronUp, Clock, ExternalLink } from "lucide-react";
import { Video } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/constants";
import {
  calculateVideoEngagement,
  formatCompactNumber,
  formatNumber,
  formatPercent,
} from "@/lib/analytics-utils";
import { formatDate, formatDuration } from "@/lib/video-calendar-utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface TopContentTableProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
}

export function TopContentTable({ videos, onSelectVideo }: TopContentTableProps) {
  const [showAll, setShowAll] = React.useState(false);

  const displayedVideos = showAll ? videos : videos.slice(0, 5);

  if (videos.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] text-center space-y-2">
        <Film className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">Top Content Leaderboard</h4>
        <p className="text-xs text-slate-500">
          No published videos available matching the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Top Content Leaderboard ({videos.length})
          </h3>
        </div>
        {videos.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            {showAll ? (
              <span className="flex items-center gap-1">
                Show Top 5 <ChevronUp className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                View All ({videos.length}) <ChevronDown className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Video Title</th>
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3 text-right">Views</th>
              <th className="py-2.5 px-3 text-right">Likes</th>
              <th className="py-2.5 px-3 text-right">Comments</th>
              <th className="py-2.5 px-3 text-right">Engagement</th>
              <th className="py-2.5 px-3 text-right">Duration</th>
              <th className="py-2.5 px-3 text-right">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {displayedVideos.map((video, idx) => {
              const platformCfg =
                PLATFORM_CONFIG[video.platform] || PLATFORM_CONFIG.YOUTUBE;
              const engagement = calculateVideoEngagement(
                video.views || 0,
                video.likes || 0,
                video.comments || 0
              );

              return (
                <tr
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3 px-3 font-mono text-slate-500 font-bold">
                    {idx + 1}
                  </td>

                  {/* Video Thumbnail + Title */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3 min-w-[200px] max-w-sm">
                      <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-black shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {video.title}
                      </span>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3">
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                        platformCfg.badge
                      )}
                    >
                      {platformCfg.label}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {formatNumber(video.views || 0)}
                  </td>

                  {/* Likes */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {formatNumber(video.likes || 0)}
                  </td>

                  {/* Comments */}
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {formatNumber(video.comments || 0)}
                  </td>

                  {/* Engagement Rate */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {formatPercent(engagement)}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {formatDuration(video.duration)}
                  </td>

                  {/* Published Date */}
                  <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                    {video.publishedAt
                      ? formatDate(video.publishedAt, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
