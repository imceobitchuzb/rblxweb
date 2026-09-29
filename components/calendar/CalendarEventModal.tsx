"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Film,
  Trash2,
  AlertCircle,
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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  initialData?: CalendarEvent | null;
  defaultDate?: string; // YYYY-MM-DD
  videos?: Video[];
}

export function CalendarEventModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  defaultDate,
  videos = [],
}: CalendarEventModalProps) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [platform, setPlatform] = React.useState<VideoPlatform>("YOUTUBE_SHORTS");
  const [type, setType] = React.useState<CalendarEventType>("VIDEO");
  const [status, setStatus] = React.useState<CalendarEventStatus>("PLANNED");
  const [videoId, setVideoId] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setScheduledAt(
        initialData.scheduledAt ? initialData.scheduledAt.slice(0, 16) : ""
      );
      setPlatform(initialData.platform || "YOUTUBE_SHORTS");
      setType(initialData.type || "VIDEO");
      setStatus(initialData.status || "PLANNED");
      setVideoId(initialData.videoId || "");
      setNotes(initialData.notes || "");
    } else {
      setTitle("");
      // If defaultDate was provided from clicking on a day cell
      if (defaultDate) {
        setScheduledAt(`${defaultDate}T17:00`);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(17, 0, 0, 0);
        setScheduledAt(d.toISOString().slice(0, 16));
      }
      setPlatform("YOUTUBE_SHORTS");
      setType("VIDEO");
      setStatus("PLANNED");
      setVideoId("");
      setNotes("");
    }
    setError("");
  }, [initialData, defaultDate, isOpen]);

  // When a video is selected, auto-populate title and platform
  const handleVideoSelect = (selectedVidId: string) => {
    setVideoId(selectedVidId);
    if (!selectedVidId) return;

    const matchedVid = videos.find((v) => v.id === selectedVidId);
    if (matchedVid) {
      if (!title || title.trim() === "") setTitle(matchedVid.title);
      setPlatform(matchedVid.platform);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an event title.");
      return;
    }
    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    const scheduledDateObj = new Date(scheduledAt);
    if (isNaN(scheduledDateObj.getTime())) {
      setError("Invalid date and time.");
      return;
    }

    const payload: Partial<CalendarEvent> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      scheduledAt: scheduledDateObj.toISOString(),
      platform,
      type,
      status,
      videoId: videoId || undefined,
      notes: notes.trim() || undefined,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <span>{isEditing ? "Edit Calendar Slot" : "Schedule Content Drop"}</span>
        </div>
      }
      description="Plan publication times, manage platform schedules, and coordinate video launches."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Event / Release Title <span className="text-rose-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. MM2 Knife Throwing Montages Drop"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>

        {/* Optional Link to Video Asset */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-violet-400" />
            Link to Video Asset (Optional)
          </label>
          <select
            value={videoId}
            onChange={(e) => handleVideoSelect(e.target.value)}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="">-- Standalone schedule item --</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.platform})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Date & Time <span className="text-rose-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Platform & Slot Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as VideoPlatform)}
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {ALL_VIDEO_PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {PLATFORM_CONFIG[plat].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Slot Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEventType)}
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {ALL_CALENDAR_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CALENDAR_EVENT_TYPE_CONFIG[t].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CalendarEventStatus)}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {ALL_CALENDAR_STATUSES.map((st) => (
              <option key={st} value={st}>
                {CALENDAR_STATUS_CONFIG[st].label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Notes & Checklist</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Release notes, thumbnail test notes, pinned comments..."
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={() => {
                if (initialData?.id) onDelete(initialData.id);
                onClose();
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {isEditing ? "Save Slot" : "Schedule Drop"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
