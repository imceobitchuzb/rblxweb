"use client";

import * as React from "react";
import { Calendar, Clock, Film, Sparkles } from "lucide-react";
import { CalendarEvent, CalendarEventType, Video } from "@/lib/types";
import { ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_TYPE_CONFIG } from "@/lib/constants";
import { createScheduleEventFromVideo } from "@/lib/video-calendar-utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ScheduleVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  onConfirmSchedule: (updatedVideo: Video, calendarEvent: CalendarEvent) => void;
}

export function ScheduleVideoModal({
  isOpen,
  onClose,
  video,
  onConfirmSchedule,
}: ScheduleVideoModalProps) {
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [eventType, setEventType] = React.useState<CalendarEventType>("VIDEO");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (video) {
      if (video.scheduledAt) {
        setScheduledAt(video.scheduledAt.slice(0, 16));
      } else {
        // Default to tomorrow at 17:00 (5 PM)
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(17, 0, 0, 0);
        setScheduledAt(d.toISOString().slice(0, 16));
      }
      setNotes("");
      setError("");
    }
  }, [video, isOpen]);

  if (!video) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError("Please select a date and time to schedule this video.");
      return;
    }

    const scheduledDateObj = new Date(scheduledAt);
    if (isNaN(scheduledDateObj.getTime())) {
      setError("Invalid date and time selected.");
      return;
    }

    const isoString = scheduledDateObj.toISOString();
    const updatedVideo: Video = {
      ...video,
      status: "SCHEDULED",
      scheduledAt: isoString,
      updatedAt: new Date().toISOString(),
    };

    const newCalendarEvent: CalendarEvent = {
      ...createScheduleEventFromVideo(video, isoString, notes),
      type: eventType,
      status: "PLANNED",
    };

    onConfirmSchedule(updatedVideo, newCalendarEvent);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Schedule Video Release</span>
        </div>
      }
      description={`Plan publication slot on the Content Calendar for "${video.title}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target Video Summary */}
        <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-white truncate">{video.title}</h5>
            <p className="text-[11px] text-slate-400">
              Platform: {video.platform} • Current Status: {video.status}
            </p>
          </div>
        </div>

        {/* Date & Time Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Publication Date & Time <span className="text-rose-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => {
              setScheduledAt(e.target.value);
              if (error) setError("");
            }}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          />
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {/* Event Slot Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Calendar Slot Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as CalendarEventType)}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {ALL_CALENDAR_EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {CALENDAR_EVENT_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Scheduling Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Calendar Notes & Checklist (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Remember to pin top comment with Discord link..."
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Confirm Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
