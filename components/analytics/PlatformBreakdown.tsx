"use client";

import * as React from "react";
import { Eye, Heart, MessageCircle, Layers, TrendingUp } from "lucide-react";
import { PlatformMetrics } from "@/lib/types";
import { PLATFORM_CONFIG } from "@/lib/constants";
import {
  formatCompactNumber,
  formatNumber,
  formatPercent,
} from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface PlatformBreakdownProps {
  metrics: PlatformMetrics[];
}

export function PlatformBreakdown({ metrics }: PlatformBreakdownProps) {
  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Platform Distribution Breakdown
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Comparative multi-channel performance
        </span>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {metrics.map((pm) => {
          const cfg = PLATFORM_CONFIG[pm.platform] || PLATFORM_CONFIG.YOUTUBE;

          return (
            <div
              key={pm.platform}
              className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-3 flex flex-col justify-between hover:border-white/10 transition-colors"
            >
              {/* Top: Badge + Video Count */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                    cfg.badge
                  )}
                >
                  {cfg.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {pm.videos} {pm.videos === 1 ? "video" : "videos"}
                </span>
              </div>

              {/* Middle: Views & Avg Views */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Views
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  {formatCompactNumber(pm.views)}
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Avg: {formatCompactNumber(pm.averageViews)} / video
                </div>
              </div>

              {/* Bottom: Likes, Comments, Engagement Rate */}
              <div className="pt-2.5 border-t border-white/[0.05] grid grid-cols-3 gap-1 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Likes</span>
                  <span className="font-bold text-slate-300 font-mono">
                    {formatCompactNumber(pm.likes)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Comments</span>
                  <span className="font-bold text-slate-300 font-mono">
                    {formatCompactNumber(pm.comments)}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Engagement</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatPercent(pm.engagementRate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
