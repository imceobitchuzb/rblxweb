"use client";

import * as React from "react";
import { Sparkles, Lightbulb, CheckCircle2, Info } from "lucide-react";
import { CreatorInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreatorInsightsProps {
  insights: CreatorInsight[];
}

export function CreatorInsights({ insights }: CreatorInsightsProps) {
  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Creator Intelligence & Dataset Insights
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Factual data observations
        </span>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((ins) => {
          return (
            <div
              key={ins.id}
              className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <h5 className="text-xs font-bold text-white">{ins.title}</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-5">
                    {ins.detail}
                  </p>
                </div>

                {ins.stat && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 font-mono text-[11px] font-bold border border-white/5 shrink-0">
                    {ins.stat}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
