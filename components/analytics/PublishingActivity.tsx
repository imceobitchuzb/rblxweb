"use client";

import * as React from "react";
import { Calendar, CheckCircle2, Clock, Film } from "lucide-react";
import { PublishingActivityData } from "@/lib/types";

interface PublishingActivityProps {
  activityData: PublishingActivityData[];
}

export function PublishingActivity({ activityData }: PublishingActivityProps) {
  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Publishing Cadence & Pipeline Activity
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Published
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Scheduled
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> In Production
          </span>
        </div>
      </div>

      {/* Activity Timeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activityData.map((item) => (
          <div
            key={item.period}
            className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-2.5"
          >
            <span className="text-xs font-bold text-white block">{item.period}</span>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Published
                </span>
                <span className="font-bold text-white">{item.published}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-cyan-400" /> Scheduled
                </span>
                <span className="font-bold text-white">{item.scheduled}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Film className="w-3 h-3 text-amber-400" /> Production
                </span>
                <span className="font-bold text-white">{item.inProduction}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
