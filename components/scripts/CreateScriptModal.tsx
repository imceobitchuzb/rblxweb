"use client";

import * as React from "react";
import { Lightbulb, Plus, Sparkles } from "lucide-react";
import { IdeaItem, Script } from "@/lib/types";
import { parseTags } from "@/lib/ideas-utils";
import { createScriptFromIdea } from "@/lib/roster-script-utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CreateScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableIdeas: IdeaItem[];
  onSubmit: (script: Script) => void;
}

export function CreateScriptModal({
  isOpen,
  onClose,
  availableIdeas,
  onSubmit,
}: CreateScriptModalProps) {
  const [sourceMode, setSourceMode] = React.useState<"scratch" | "idea">("scratch");
  const [selectedIdeaId, setSelectedIdeaId] = React.useState<string>("");

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [hook, setHook] = React.useState("");
  const [tagsString, setTagsString] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setSourceMode("scratch");
      setSelectedIdeaId("");
      setTitle("");
      setDescription("");
      setHook("");
      setTagsString("");
      setError("");
    }
  }, [isOpen]);

  const handleSelectIdea = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    const idea = availableIdeas.find((i) => i.id === ideaId);
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description);
      setHook(`Hook for ${idea.title}...`);
      setTagsString(idea.tags.join(", "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Script title is required");
      return;
    }

    const timestamp = new Date().toISOString();
    const tags = parseTags(tagsString);

    const newScript: Script = {
      id: `script-${Date.now()}`,
      ideaId: sourceMode === "idea" && selectedIdeaId ? selectedIdeaId : undefined,
      title: title.trim(),
      description: description.trim(),
      status: "DRAFT",
      hook: hook.trim(),
      tags,
      estimatedDuration: 15,
      createdAt: timestamp,
      updatedAt: timestamp,
      characters: [],
      scenes: [
        {
          id: `scene-${Date.now()}-1`,
          title: "Scene 1: Opening Hook",
          description: "Establish the opening scene and situation.",
          duration: 15,
          notes: "Initial establishing camera shot.",
          characters: [],
          dialogue: [],
        },
      ],
    };

    onSubmit(newScript);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Animation Script"
      description="Write from scratch or convert a brainstormed video idea into a structured script."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-canvas border border-white/5">
          <button
            type="button"
            onClick={() => {
              setSourceMode("scratch");
              setSelectedIdeaId("");
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              sourceMode === "scratch"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Start From Scratch
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("idea")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              sourceMode === "idea"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>From Video Idea</span>
          </button>
        </div>

        {/* Idea Selector if sourceMode is 'idea' */}
        {sourceMode === "idea" && (
          <div className="p-3.5 rounded-xl bg-surface-canvas/80 border border-violet-500/20 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Roblox Idea Concept
            </label>
            <select
              value={selectedIdeaId}
              onChange={(e) => handleSelectIdea(e.target.value)}
              className="w-full bg-surface-panel text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="">-- Choose an idea to import --</option>
              {availableIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  [{idea.category}] {idea.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Script Title <span className="text-red-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. He Had ONE Job"
            className={error ? "border-red-500/80" : ""}
          />
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        {/* Opening Hook */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Opening Hook (First 3 Seconds)
          </label>
          <Input
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="e.g. The sheriff looked into my eyes... and shot the guy eating cheese."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Script Synopsis
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of the video scenario..."
            className="w-full bg-surface-canvas/80 text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-4 py-2 text-sm transition-all focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Tags
          </label>
          <Input
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="MM2, Funny, Skit"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Script
          </Button>
        </div>
      </form>
    </Modal>
  );
}
