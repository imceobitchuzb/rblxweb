"use client";

import * as React from "react";
import { Character, CharacterRole } from "@/lib/types";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/constants";
import { parseTags } from "@/lib/ideas-utils";
import { validateCharacterForm } from "@/lib/roster-script-utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (characterData: Omit<Character, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  initialData?: Character | null;
}

export function CharacterModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CharacterModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<CharacterRole>("SUPPORTING");
  const [description, setDescription] = React.useState("");
  const [personality, setPersonality] = React.useState("");
  const [outfit, setOutfit] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [tagsString, setTagsString] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setDescription(initialData.description);
      setPersonality(initialData.personality || "");
      setOutfit(initialData.outfit || "");
      setAvatar(initialData.avatar || initialData.avatarUrl || "");
      setTagsString(initialData.tags ? initialData.tags.join(", ") : "");
      setNotes(initialData.notes || "");
    } else {
      setName("");
      setRole("SUPPORTING");
      setDescription("");
      setPersonality("");
      setOutfit("");
      setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200");
      setTagsString("");
      setNotes("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCharacterForm({
      name,
      role,
      description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const tags = parseTags(tagsString);

    onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: name.trim(),
      role,
      description: description.trim(),
      personality: personality.trim(),
      outfit: outfit.trim(),
      avatar: avatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      avatarUrl: avatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
      tags,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Roblox Character" : "Create New Roblox Character"}
      description={
        isEditing
          ? "Update character persona, outfit, role, or background story."
          : "Add a new cast member to your Roblox universe for scripts and skits."
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Character Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Sheriff Knox, Bacon Benny"
              className={errors.name ? "border-red-500/80" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CharacterRole)}
              className="w-full bg-surface-canvas/90 text-slate-100 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r} className="bg-surface-panel text-white">
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personality Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Personality Summary
          </label>
          <Input
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="e.g. Over-confident, jumps at shadows, quick to draw but terrible aim"
          />
        </div>

        {/* Description / Background */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description & Backstory <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Describe roleplay habits, dialogue cadence, and signature quirks..."
            className={`w-full bg-surface-canvas/80 text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-4 py-2 text-sm transition-all focus:outline-none focus:border-violet-500 ${
              errors.description ? "border-red-500/80" : ""
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Outfit & Avatar in 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Avatar Outfit
            </label>
            <Input
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              placeholder="e.g. Classic Bacon hair, blue motorcycle jacket"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />
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
            placeholder="Sheriff, Hero, MM2, Revolver"
          />
        </div>

        {/* Studio Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Production & Voice Notes
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Voice line should sound like a dramatic 80s cop film parody"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? "Save Changes" : "Create Character"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
