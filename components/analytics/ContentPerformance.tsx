"use client";

import * as React from "react";
import { BarChart3, PieChart, Sparkles } from "lucide-react";
import { CategoryPerformance, FormatPerformance, Video } from "@/lib/types";
import {
  formatCompactNumber,
  formatPercent,
} from "@/lib/analytics-utils";

interface ContentPerformanceProps {
  categories: CategoryPerformance[];
  formats: FormatPerformance[];
  videos: Video[];
}

export function ContentPerformance({
  categories,
  formats,
  videos,
}: ContentPerformanceProps) {
  // Derive duration brackets
  const published = videos.filter((v) => v.status === "PUBLISHED");

  const durationBrackets = React.useMemo(() => {
    if (published.length === 0) return [];

    const brackets = [
      { label: "< 30s", min: 0, max: 30 },
      { label: "30s – 60s", min: 30, max: 60 },
      { label: "1m – 5m", min: 60, max: 300 },
      { label: "> 5m", min: 300, max: Infinity },
    ];

    return brackets.map((b) => {
      const matched = published.filter(
        (v) => v.duration >= b.min && v.duration < b.max
      );
      const totalViews = matched.reduce((acc, v) => acc + (v.views || 0), 0);
      const avgViews = matched.length > 0 ? Math.round(totalViews / matched.length) : 0;

      return {
        label: b.label,
        count: matched.length,
        totalViews,
        averageViews: avgViews,
      };
    });
  }, [published]);

  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Content Segments & Format Analysis
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Category & length performance
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: By Roblox Category */}
        <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>By Category</span>
            <span className="text-[10px] text-slate-500 font-mono">From Ideas</span>
          </h4>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Not enough data
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.category}
                  className="p-2.5 rounded-lg bg-surface-elevated/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{cat.category}</span>
                    <span className="text-[10px] text-slate-400">
                      {cat.videoCount} {cat.videoCount === 1 ? "video" : "videos"}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-white block">
                      {formatCompactNumber(cat.totalViews)}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      {formatPercent(cat.averageEngagementRate)} eng
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: By Video Format (Short vs Long) */}
        <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>By Format</span>
            <span className="text-[10px] text-slate-500 font-mono">Short vs Long</span>
          </h4>

          {formats.every((f) => f.videoCount === 0) ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Not enough data
            </p>
          ) : (
            <div className="space-y-2">
              {formats.map((fmt) => (
                <div
                  key={fmt.format}
                  className="p-2.5 rounded-lg bg-surface-elevated/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{fmt.format}</span>
                    <span className="text-[10px] text-slate-400">
                      {fmt.videoCount} {fmt.videoCount === 1 ? "video" : "videos"}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-white block">
                      {formatCompactNumber(fmt.totalViews)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Avg {formatCompactNumber(fmt.averageViews)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: By Video Duration Brackets */}
        <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>By Duration Bracket</span>
            <span className="text-[10px] text-slate-500 font-mono">Runtime Groups</span>
          </h4>

          {durationBrackets.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              Not enough data
            </p>
          ) : (
            <div className="space-y-2">
              {durationBrackets.map((brk) => (
                <div
                  key={brk.label}
                  className="p-2.5 rounded-lg bg-surface-elevated/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{brk.label}</span>
                    <span className="text-[10px] text-slate-400">
                      {brk.count} {brk.count === 1 ? "video" : "videos"}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-white block">
                      {formatCompactNumber(brk.totalViews)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {brk.count > 0 ? `Avg ${formatCompactNumber(brk.averageViews)}` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
