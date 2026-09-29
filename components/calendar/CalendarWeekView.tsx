"use client";

import * as React from "react";
import { Plus, Clock } from "lucide-react";
import { CalendarEvent } from "@/lib/types";
import {
  CALENDAR_EVENT_TYPE_CONFIG,
  CALENDAR_STATUS_CONFIG,
  PLATFORM_CONFIG,
} from "@/lib/constants";
import { CalendarDayCell, formatTime } from "@/lib/video-calendar-utils";
import { cn } from "@/lib/utils";

interface CalendarWeekViewProps {
  days: CalendarDayCell[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (dateKey: string) => void;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function CalendarWeekView({
  days,
  onSelectEvent,
  onSelectDate,
}: CalendarWeekViewProps) {
  return (
    <div className="rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
        {days.map((day, idx) => {
          return (
            <div
              key={day.dateKey}
              className={cn(
                "min-h-[300px] p-3 flex flex-col space-y-3 transition-colors",
                day.isToday ? "bg-violet-950/15" : "bg-transparent hover:bg-white/[0.01]"
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {WEEKDAYS[idx].slice(0, 3)}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-black font-mono",
                      day.isToday ? "text-violet-400" : "text-white"
                    )}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                <button
                  type="button"
                  title="Add Event to this day"
                  onClick={() => onSelectDate(day.dateKey)}
                  className="w-7 h-7 rounded-lg bg-surface-canvas hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Stack for this Day */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {day.events.length === 0 ? (
                  <div
                    onClick={() => onSelectDate(day.dateKey)}
                    className="h-20 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[11px] text-slate-500 hover:text-slate-400 hover:border-white/20 cursor-pointer transition-colors"
                  >
                    + Add Slot
                  </div>
                ) : (
                  day.events.map((event) => {
                    const typeCfg =
                      CALENDAR_EVENT_TYPE_CONFIG[event.type] ||
                      CALENDAR_EVENT_TYPE_CONFIG.VIDEO;
                    const platformCfg =
                      PLATFORM_CONFIG[event.platform] || PLATFORM_CONFIG.YOUTUBE;
                    const statusCfg =
                      CALENDAR_STATUS_CONFIG[event.status] ||
                      CALENDAR_STATUS_CONFIG.PLANNED;

                    return (
                      <div
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer space-y-1.5 shadow-sm",
                          typeCfg.bg,
                          typeCfg.border
                        )}
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
                          <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            {formatTime(event.scheduledAt)}
                          </span>
                        </div>

                        <h6 className="text-xs font-bold text-white line-clamp-2">
                          {event.title}
                        </h6>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">
                            {typeCfg.label}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1",
                              statusCfg.bg,
                              statusCfg.text
                            )}
                          >
                            <span className={cn("w-1 h-1 rounded-full", statusCfg.dot)} />
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
