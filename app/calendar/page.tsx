"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  Layers,
  Sparkles,
  Radio,
  Clock,
  Flame,
} from "lucide-react";
import {
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  Video,
  VideoPlatform,
} from "@/lib/types";
import {
  ALL_CALENDAR_EVENT_TYPES,
  ALL_CALENDAR_STATUSES,
  ALL_VIDEO_PLATFORMS,
  CALENDAR_EVENT_TYPE_CONFIG,
  CALENDAR_STATUS_CONFIG,
  PLATFORM_CONFIG,
} from "@/lib/constants";
import { INITIAL_CALENDAR_EVENTS } from "@/lib/mock-calendar";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import {
  filterCalendarEvents,
  getMonthGrid,
  getUpcomingEvents,
  getWeekDays,
} from "@/lib/video-calendar-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CalendarMonthView } from "@/components/calendar/CalendarMonthView";
import { CalendarWeekView } from "@/components/calendar/CalendarWeekView";
import { UpcomingContentPanel } from "@/components/calendar/UpcomingContentPanel";
import { CalendarEventModal } from "@/components/calendar/CalendarEventModal";
import { VideoDetailsModal } from "@/components/videos/VideoDetailsModal";
import { cn } from "@/lib/utils";
import {
  createCalendarEventAction,
  deleteCalendarEventAction,
  fetchCalendarEventsAction,
  updateCalendarEventAction,
} from "@/app/actions/calendar";
import { fetchVideosAction } from "@/app/actions/videos";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Consistent anchor date for mock workspace
const MOCK_TODAY = new Date("2026-09-29T12:00:00.000Z");

function CalendarContent() {
  const searchParams = useSearchParams();

  // State
  const [events, setEvents] = React.useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [videos, setVideos] = React.useState<Video[]>(INITIAL_VIDEOS);

  // Load from persistent storage on mount
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [calRes, vidRes] = await Promise.all([
        fetchCalendarEventsAction(),
        fetchVideosAction(),
      ]);
      if (mounted) {
        if (calRes.success) setEvents(calRes.data);
        if (vidRes.success) setVideos(vidRes.data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Calendar timeline navigation state
  const [viewMode, setViewMode] = React.useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date(MOCK_TODAY));

  // Filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState<VideoPlatform | "ALL">("ALL");
  const [selectedType, setSelectedType] = React.useState<CalendarEventType | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<CalendarEventStatus | "ALL">("ALL");

  // Modals
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null);
  const [selectedDateForNew, setSelectedDateForNew] = React.useState<string | undefined>(undefined);
  const [inspectVideo, setInspectVideo] = React.useState<Video | null>(null);

  // Derived filtered events
  const filteredEvents = React.useMemo(() => {
    return filterCalendarEvents(events, {
      search: searchTerm,
      platform: selectedPlatform,
      type: selectedType,
      status: selectedStatus,
    });
  }, [events, searchTerm, selectedPlatform, selectedType, selectedStatus]);

  // Month grid
  const monthGrid = React.useMemo(() => {
    return getMonthGrid(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      filteredEvents,
      MOCK_TODAY
    );
  }, [currentDate, filteredEvents]);

  // Week days
  const weekDays = React.useMemo(() => {
    return getWeekDays(currentDate, filteredEvents, MOCK_TODAY);
  }, [currentDate, filteredEvents]);

  // Upcoming events
  const upcomingEvents = React.useMemo(() => {
    return getUpcomingEvents(events, 6, MOCK_TODAY);
  }, [events]);

  // Navigation handlers
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "month") {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else {
      nextDate.setDate(nextDate.getDate() - 7);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "month") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(MOCK_TODAY));
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateForNew(dateKey);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.videoId) {
      const matched = videos.find((v) => v.id === event.videoId);
      if (matched) {
        setInspectVideo(matched);
        return;
      }
    }
    setEditingEvent(event);
    setSelectedDateForNew(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
      const res = await updateCalendarEventAction(eventData.id, eventData);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventData.id ? res.data : e))
        );
      }
    } else {
      const res = await createCalendarEventAction({
        title: eventData.title || "Untitled Slot",
        scheduledAt: eventData.scheduledAt || new Date().toISOString(),
        type: eventData.type || "VIDEO",
        platform: eventData.platform || "YOUTUBE_SHORTS",
        status: eventData.status || "PLANNED",
        videoId: eventData.videoId,
        notes: eventData.notes,
      });
      if (res.success) {
        setEvents((prev) => [...prev, res.data]);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteCalendarEventAction(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPlatform("ALL");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
  };

  const isFiltered =
    searchTerm !== "" ||
    selectedPlatform !== "ALL" ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Content Calendar
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              Publishing Timetable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Coordinate multi-platform release slots, live premieres, and upload streak deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Creator Streak Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="font-bold">14 Day Upload Streak</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingEvent(null);
              setSelectedDateForNew(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Schedule Content</span>
          </Button>
        </div>
      </div>

      {/* Date Navigation & View Mode Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08]">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl"
            aria-label="Previous period"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs px-2.5 rounded-xl font-bold"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl"
            aria-label="Next period"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <h3 className="text-base font-black text-white font-mono ml-2">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-surface-canvas border border-white/5">
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all",
              viewMode === "month"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all",
              viewMode === "week"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            )}
          >
            Week
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scheduled slots..."
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Platform */}
          <div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as VideoPlatform | "ALL")}
              aria-label="Filter by Platform"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 h-8 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Platforms</option>
              {ALL_VIDEO_PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {PLATFORM_CONFIG[plat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CalendarEventType | "ALL")}
              aria-label="Filter by Type"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 h-8 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Event Types</option>
              {ALL_CALENDAR_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CALENDAR_EVENT_TYPE_CONFIG[t].label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CalendarEventStatus | "ALL")}
              aria-label="Filter by Status"
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 h-8 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              {ALL_CALENDAR_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {CALENDAR_STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px]">
            <span className="text-slate-400">
              Showing {filteredEvents.length} filtered slots
            </span>
            <button
              onClick={handleResetFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Calendar Grid + Upcoming Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar Grid (3 Columns on Large screens) */}
        <div className="lg:col-span-3">
          {viewMode === "month" ? (
            <CalendarMonthView
              cells={monthGrid}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
            />
          ) : (
            <CalendarWeekView
              days={weekDays}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
            />
          )}
        </div>

        {/* Sidebar Panel: Upcoming Releases */}
        <div className="lg:col-span-1">
          <UpcomingContentPanel
            upcomingEvents={upcomingEvents}
            onSelectEvent={handleSelectEvent}
            onOpenCreate={() => {
              setEditingEvent(null);
              setSelectedDateForNew(undefined);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Calendar Event Modal */}
      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          setSelectedDateForNew(undefined);
        }}
        onSubmit={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialData={editingEvent}
        defaultDate={selectedDateForNew}
        videos={videos}
      />

      {/* Video Details Modal (when clicked from linked event) */}
      <VideoDetailsModal
        isOpen={Boolean(inspectVideo)}
        onClose={() => setInspectVideo(null)}
        video={inspectVideo}
        onEdit={() => {}}
        onSchedule={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-medium">
          Loading Publishing Calendar...
        </div>
      }
    >
      <CalendarContent />
    </React.Suspense>
  );
}
