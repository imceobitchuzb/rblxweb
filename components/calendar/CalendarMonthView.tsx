"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { CalendarEvent, VideoPlatform } from "@/lib/types";
import {
  CALENDAR_EVENT_TYPE_CONFIG,
  CALENDAR_STATUS_CONFIG,
  PLATFORM_CONFIG,
} from "@/lib/constants";
import { CalendarDayCell, formatTime } from "@/lib/video-calendar-utils";
import { cn } from "@/lib/utils";

interface CalendarMonthViewProps {
  cells: CalendarDayCell[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (dateKey: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  cells,
  onSelectEvent,
  onSelectDate,
}: CalendarMonthViewProps) {
  return (
    <div className="rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] overflow-hidden">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-surface-canvas/60 text-center py-2.5">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-[11px] font-bold uppercase tracking-wider text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.05] bg-surface-panel/50">
        {cells.map((cell) => {
          return (
            <div
              key={cell.dateKey}
              onClick={() => onSelectDate(cell.dateKey)}
              className={cn(
                "min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-colors group relative cursor-pointer",
                cell.isCurrentMonth
                  ? "bg-transparent hover:bg-white/[0.02]"
                  : "bg-surface-canvas/30 opacity-40 hover:opacity-60",
                cell.isToday && "ring-1 ring-inset ring-violet-500/50 bg-violet-950/10"
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                    cell.isToday
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                      : "text-slate-300 group-hover:text-white"
                  )}
                >
                  {cell.dayNumber}
                </span>

                <button
                  type="button"
                  title="Add Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(cell.dateKey);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Events in Cell */}
              <div className="space-y-1 mt-1.5 flex-1 overflow-hidden">
                {cell.events.slice(0, 3).map((event) => {
                  const typeCfg =
                    CALENDAR_EVENT_TYPE_CONFIG[event.type] ||
                    CALENDAR_EVENT_TYPE_CONFIG.VIDEO;
                  const platformCfg =
                    PLATFORM_CONFIG[event.platform] || PLATFORM_CONFIG.YOUTUBE;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      title={`${event.title} (${typeCfg.label} - ${formatTime(event.scheduledAt)})`}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium border truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1",
                        typeCfg.bg,
                        typeCfg.text,
                        typeCfg.border
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}

                {cell.events.length > 3 && (
                  <div className="text-[9px] text-slate-400 font-semibold px-1">
                    +{cell.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
