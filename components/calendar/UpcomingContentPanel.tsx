"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { CalendarEvent } from "@/lib/types";
import {
  CALENDAR_EVENT_TYPE_CONFIG,
  CALENDAR_STATUS_CONFIG,
  PLATFORM_CONFIG,
} from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/video-calendar-utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface UpcomingContentPanelProps {
  upcomingEvents: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreate: () => void;
}

export function UpcomingContentPanel({
  upcomingEvents,
  onSelectEvent,
  onOpenCreate,
}: UpcomingContentPanelProps) {
  return (
    <div className="rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Upcoming Drops ({upcomingEvents.length})
          </h3>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCreate}
          className="h-7 text-xs px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Slot
        </Button>
      </div>

      {/* Events List */}
      {upcomingEvents.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-surface-canvas/40 border border-white/5 space-y-2">
          <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
          <p>No upcoming content slots scheduled.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcomingEvents.map((event) => {
            const platformCfg =
              PLATFORM_CONFIG[event.platform] || PLATFORM_CONFIG.YOUTUBE;
            const typeCfg =
              CALENDAR_EVENT_TYPE_CONFIG[event.type] ||
              CALENDAR_EVENT_TYPE_CONFIG.VIDEO;

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="p-3 rounded-xl bg-surface-canvas/60 border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                      platformCfg.badge
                    )}
                  >
                    {platformCfg.label}
                  </span>

                  <span className="text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDate(event.scheduledAt, { month: "short", day: "numeric" })},{" "}
                    {formatTime(event.scheduledAt)}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {event.title}
                </h5>

                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      typeCfg.bg,
                      typeCfg.text,
                      typeCfg.border
                    )}
                  >
                    {typeCfg.label}
                  </span>

                  {event.videoId && (
                    <span className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                      <Film className="w-2.5 h-2.5" />
                      Linked Asset
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
