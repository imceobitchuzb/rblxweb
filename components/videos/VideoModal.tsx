"use client";

import * as React from "react";
import { Film, Sparkles, Image as ImageIcon, Tag, Users, Calendar, AlertCircle } from "lucide-react";
import { Character, Script, Video, VideoPlatform, VideoStatus } from "@/lib/types";
import {
  ALL_VIDEO_PLATFORMS,
  ALL_VIDEO_STATUSES,
  PLATFORM_CONFIG,
  VIDEO_STATUS_LABELS,
} from "@/lib/constants";
import { validateVideoForm } from "@/lib/video-calendar-utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (videoData: Partial<Video>) => void;
  initialData?: Video | null;
  characters?: Character[];
  scripts?: Script[];
}

const PRESET_THUMBNAILS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
];

export function VideoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  characters = [],
  scripts = [],
}: VideoModalProps) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [platform, setPlatform] = React.useState<VideoPlatform>("YOUTUBE_SHORTS");
  const [status, setStatus] = React.useState<VideoStatus>("PLANNING");
  const [duration, setDuration] = React.useState<number>(45);
  const [thumbnail, setThumbnail] = React.useState("");
  const [tagsString, setTagsString] = React.useState("");
  const [selectedCharIds, setSelectedCharIds] = React.useState<string[]>([]);
  const [scriptId, setScriptId] = React.useState<string>("");
  const [ideaId, setIdeaId] = React.useState<string>("");
  const [scheduledAt, setScheduledAt] = React.useState<string>("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPlatform(initialData.platform || "YOUTUBE_SHORTS");
      setStatus(initialData.status || "PLANNING");
      setDuration(initialData.duration || 45);
      setThumbnail(initialData.thumbnail || PRESET_THUMBNAILS[0]);
      setTagsString(initialData.tags ? initialData.tags.join(", ") : "");
      setSelectedCharIds(initialData.characterIds || []);
      setScriptId(initialData.scriptId || "");
      setIdeaId(initialData.ideaId || "");
      setScheduledAt(
        initialData.scheduledAt ? initialData.scheduledAt.slice(0, 16) : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setPlatform("YOUTUBE_SHORTS");
      setStatus("PLANNING");
      setDuration(45);
      setThumbnail(PRESET_THUMBNAILS[0]);
      setTagsString("MM2, Roblox, Funny");
      setSelectedCharIds([]);
      setScriptId("");
      setIdeaId("");
      setScheduledAt("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  // When a script is selected, auto-populate title, description, characters, ideaId
  const handleScriptChange = (selectedScriptId: string) => {
    setScriptId(selectedScriptId);
    if (!selectedScriptId) return;

    const matchedScript = scripts.find((s) => s.id === selectedScriptId);
    if (matchedScript) {
      if (!title) setTitle(matchedScript.title);
      if (!description) setDescription(matchedScript.description || matchedScript.hook);
      if (matchedScript.characters.length > 0) {
        setSelectedCharIds((prev) =>
          Array.from(new Set([...prev, ...matchedScript.characters]))
        );
      }
      if (matchedScript.tags.length > 0 && !tagsString) {
        setTagsString(matchedScript.tags.join(", "));
      }
      if (matchedScript.ideaId) {
        setIdeaId(matchedScript.ideaId);
      }
      if (matchedScript.estimatedDuration) {
        setDuration(Math.round(matchedScript.estimatedDuration));
      }
    }
  };

  const handleToggleCharacter = (charId: string) => {
    setSelectedCharIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsString
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const videoPayload: Partial<Video> = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      description: description.trim(),
      platform,
      status,
      duration: Number(duration) || 0,
      thumbnail: thumbnail.trim() || PRESET_THUMBNAILS[0],
      tags,
      characterIds: selectedCharIds,
      scriptId: scriptId || undefined,
      ideaId: ideaId || undefined,
      scheduledAt: status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : initialData?.scheduledAt,
      views: initialData?.views ?? 0,
      likes: initialData?.likes ?? 0,
      comments: initialData?.comments ?? 0,
    };

    const validation = validateVideoForm(videoPayload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(videoPayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-violet-400" />
          <span>{isEditing ? "Edit Video Asset" : "Create New Video Asset"}</span>
        </div>
      }
      description="Configure video details, target platform, production status, and cast assignment."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Video Title <span className="text-rose-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="e.g. HE HAD ONE JOB! 😱 (MM2 Sheriff Betrayal)"
          />
          {errors.title && (
            <p className="text-xs text-rose-400 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Platform & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as VideoPlatform)}
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
            >
              {ALL_VIDEO_PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {PLATFORM_CONFIG[plat].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Workflow Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VideoStatus)}
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
            >
              {ALL_VIDEO_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {VIDEO_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Link from Script Studio (Workflow Integration) */}
        <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-2">
          <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Link to Screenplay (Script Studio)
          </label>
          <select
            value={scriptId}
            onChange={(e) => handleScriptChange(e.target.value)}
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="">-- No linked script (Standalone Video) --</option>
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status}) • {s.scenes.length} scenes
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Selecting a script automatically syncs title, cast members, tags, and runtime.
          </p>
        </div>

        {/* Duration & Scheduled Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Duration (in seconds)
            </label>
            <Input
              type="number"
              min={1}
              max={7200}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
            {errors.duration && (
              <p className="text-xs text-rose-400 mt-1">{errors.duration}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Schedule Release (Optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Video concept, description, or YouTube hook..."
            className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {/* Cast Assignment */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Featured Roblox Cast ({selectedCharIds.length} selected)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-surface-canvas/60 border border-white/5">
            {characters.map((char) => {
              const isSelected = selectedCharIds.includes(char.id);
              return (
                <button
                  type="button"
                  key={char.id}
                  onClick={() => handleToggleCharacter(char.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border",
                    isSelected
                      ? "bg-violet-600/30 border-violet-500 text-white font-bold"
                      : "bg-surface-elevated/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-surface-panel shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={char.avatar || char.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{char.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Tags (comma separated)
          </label>
          <Input
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="MM2, RobloxFunny, SheriffFail, Chroma"
          />
        </div>

        {/* Thumbnail URL & Presets */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            Thumbnail Image URL
          </label>
          <Input
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://..."
          />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 uppercase">Presets:</span>
            <div className="flex gap-1.5">
              {PRESET_THUMBNAILS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setThumbnail(preset)}
                  className="w-8 h-6 rounded overflow-hidden border border-white/10 hover:border-violet-400 shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isEditing ? "Save Changes" : "Create Video Asset"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
