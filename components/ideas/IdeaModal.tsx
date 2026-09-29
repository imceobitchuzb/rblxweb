"use client";

import * as React from "react";
import { IdeaCategory, IdeaItem, IdeaPriority, IdeaStatus } from "@/lib/types";
import {
  ALL_CATEGORIES,
  ALL_PRIORITIES,
  ALL_STATUSES,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  STATUS_LABELS,
} from "@/lib/constants";
import { parseTags, validateIdeaForm } from "@/lib/ideas-utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ideaData: Omit<IdeaItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  initialData?: IdeaItem | null;
}

export function IdeaModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: IdeaModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<IdeaCategory>("MM2");
  const [status, setStatus] = React.useState<IdeaStatus>("IDEA");
  const [priority, setPriority] = React.useState<IdeaPriority>("HIGH");
  const [tagsString, setTagsString] = React.useState("");
  const [potentialScore, setPotentialScore] = React.useState<number>(8.5);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset or populate fields when modal opens or initialData changes
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setTagsString(initialData.tags ? initialData.tags.join(", ") : "");
      setPotentialScore(initialData.potentialScore || 8.0);
    } else {
      setTitle("");
      setDescription("");
      setCategory("MM2");
      setStatus("IDEA");
      setPriority("HIGH");
      setTagsString("");
      setPotentialScore(8.5);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateIdeaForm({
      title,
      description,
      category,
      status,
      priority,
      potentialScore: Number(potentialScore),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const tags = parseTags(tagsString);

    onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      tags,
      potentialScore: Number(potentialScore),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Roblox Content Idea" : "Create New Roblox Video Idea"}
      description={
        isEditing
          ? "Update details, category, priority, or viral potential score."
          : "Draft a new concept, script hook, and tag classification."
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Video Title <span className="text-red-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="e.g. The Sheriff Trusted The Wrong Player"
            className={errors.title ? "border-red-500/80 focus:border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-xs text-red-400 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Concept & Script Hook <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Describe the gameplay scenario, comedy twist, or narrative storyline..."
            className={`w-full bg-surface-canvas/80 text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 ${
              errors.description ? "border-red-500/80 focus:border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Category & Priority in 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IdeaCategory)}
              className="w-full bg-surface-canvas/90 text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-panel text-white">
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IdeaPriority)}
              className="w-full bg-surface-canvas/90 text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p} className="bg-surface-panel text-white">
                  {PRIORITY_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status & Potential Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Pipeline Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className="w-full bg-surface-canvas/90 text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-surface-panel text-white">
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Potential Viral Score
              </label>
              <span className="text-xs font-bold text-cyan-400">
                {Number(potentialScore).toFixed(1)} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={potentialScore}
              onChange={(e) => setPotentialScore(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-surface-canvas rounded-lg cursor-pointer"
            />
            {errors.potentialScore && (
              <p className="text-xs text-red-400 mt-1">{errors.potentialScore}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Tags (Comma-separated)
          </label>
          <Input
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="MM2, SheriffFail, FunnyMoments, Clutch"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Separate tags with commas. Hashtags (#) are automatically trimmed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? "Save Changes" : "Create Idea"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
