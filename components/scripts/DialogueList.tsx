"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  Character,
  DialogueEmotion,
  DialogueLine,
  Scene,
} from "@/lib/types";
import { ALL_EMOTIONS, EMOTION_CONFIG, ROLE_CONFIG } from "@/lib/constants";
import { resolveCharacter } from "@/lib/roster-script-utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DialogueListProps {
  scene: Scene;
  characters: Character[];
  onUpdateScene: (updatedScene: Scene) => void;
}

export function DialogueList({
  scene,
  characters,
  onUpdateScene,
}: DialogueListProps) {
  // Update scene meta properties
  const handleMetaChange = (field: keyof Scene, value: any) => {
    onUpdateScene({
      ...scene,
      [field]: value,
    });
  };

  // Add new dialogue line
  const handleAddDialogue = () => {
    const defaultCharId =
      scene.characters && scene.characters.length > 0
        ? scene.characters[0]
        : characters.length > 0
        ? characters[0].id
        : "";

    const newLine: DialogueLine = {
      id: `d-${Date.now()}`,
      characterId: defaultCharId,
      emotion: "NEUTRAL",
      text: "",
      duration: 3.0,
    };

    onUpdateScene({
      ...scene,
      dialogue: [...scene.dialogue, newLine],
    });
  };

  // Update specific dialogue line
  const handleUpdateLine = (lineId: string, updates: Partial<DialogueLine>) => {
    const updatedDialogue = scene.dialogue.map((line) =>
      line.id === lineId ? { ...line, ...updates } : line
    );

    // If characterId was updated, ensure it's in the scene's character list
    let updatedChars = [...scene.characters];
    if (updates.characterId && !updatedChars.includes(updates.characterId)) {
      updatedChars.push(updates.characterId);
    }

    onUpdateScene({
      ...scene,
      dialogue: updatedDialogue,
      characters: updatedChars,
    });
  };

  // Delete line
  const handleDeleteLine = (lineId: string) => {
    onUpdateScene({
      ...scene,
      dialogue: scene.dialogue.filter((l) => l.id !== lineId),
    });
  };

  // Reorder dialogue lines
  const handleMoveLine = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= scene.dialogue.length) return;

    const list = [...scene.dialogue];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    onUpdateScene({
      ...scene,
      dialogue: list,
    });
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl border border-white/[0.06] bg-surface-panel/80 p-4 space-y-4 overflow-y-auto">
      {/* Scene Header & Metadata */}
      <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Scene Heading
            </label>
            <Input
              value={scene.title}
              onChange={(e) => handleMetaChange("title", e.target.value)}
              placeholder="e.g. Scene Title..."
              className="font-bold text-sm bg-surface-panel/90 h-9"
            />
          </div>

          <div className="w-full sm:w-36">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Duration (Seconds)
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max="600"
                value={scene.duration}
                onChange={(e) =>
                  handleMetaChange("duration", Math.max(1, Number(e.target.value)))
                }
                className="bg-surface-panel/90 h-9 text-xs pl-8 font-mono"
              />
              <Clock className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Action & Setting Description
            </label>
            <textarea
              rows={2}
              value={scene.description}
              onChange={(e) => handleMetaChange("description", e.target.value)}
              placeholder="What are the avatars doing? Camera motion, movements, lighting..."
              className="w-full bg-surface-panel/90 text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-3 py-1.5 text-xs transition-all focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Director Notes & Audio Cues
            </label>
            <textarea
              rows={2}
              value={scene.notes}
              onChange={(e) => handleMetaChange("notes", e.target.value)}
              placeholder="Soundboard triggers, slow-mo edits, bass drops..."
              className="w-full bg-surface-panel/90 text-slate-100 placeholder:text-slate-500 border border-white/10 rounded-xl px-3 py-1.5 text-xs transition-all focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Dialogue Script Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Dialogue Lines ({scene.dialogue.length})
            </h4>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="h-7 px-3 text-xs gap-1"
            onClick={handleAddDialogue}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dialogue</span>
          </Button>
        </div>

        {scene.dialogue.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl border border-dashed border-white/10 text-center bg-surface-canvas/30 space-y-2">
            <p className="text-sm font-semibold text-slate-300">
              No dialogue lines in this scene yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add speech cues for your Roblox characters, set their emotion and delivery pacing.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddDialogue}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Line
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scene.dialogue.map((line, index) => {
              const char = resolveCharacter(line.characterId, characters);
              const emotionInfo =
                EMOTION_CONFIG[line.emotion] || EMOTION_CONFIG.NEUTRAL;
              const roleStyle = char
                ? ROLE_CONFIG[char.role]
                : ROLE_CONFIG.NPC;

              return (
                <div
                  key={line.id}
                  className="p-3.5 rounded-2xl bg-surface-canvas/70 border border-white/[0.06] hover:border-violet-500/30 transition-all space-y-2.5 group"
                >
                  {/* Line Header: Character select, Emotion select, Duration */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
                    {/* Character & Role */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            char?.avatar ||
                            char?.avatarUrl ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                          }
                          alt={char?.name || "Character"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <select
                        value={line.characterId}
                        onChange={(e) =>
                          handleUpdateLine(line.id, { characterId: e.target.value })
                        }
                        className="bg-surface-panel text-white font-bold text-xs border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:border-violet-500"
                      >
                        {characters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Emotion & Duration & Actions */}
                    <div className="flex items-center gap-2">
                      {/* Emotion selector */}
                      <div className="flex items-center gap-1 bg-surface-panel px-2 py-1 rounded-lg border border-white/5">
                        <span className="text-sm">{emotionInfo.icon}</span>
                        <select
                          value={line.emotion}
                          onChange={(e) =>
                            handleUpdateLine(line.id, {
                              emotion: e.target.value as DialogueEmotion,
                            })
                          }
                          className="bg-transparent text-[11px] font-semibold text-slate-200 focus:outline-none cursor-pointer"
                        >
                          {ALL_EMOTIONS.map((em) => (
                            <option
                              key={em}
                              value={em}
                              className="bg-surface-panel text-white"
                            >
                              {EMOTION_CONFIG[em].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Line Duration */}
                      <div className="flex items-center gap-1 bg-surface-panel px-2 py-1 rounded-lg border border-white/5">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="60"
                          value={line.duration}
                          onChange={(e) =>
                            handleUpdateLine(line.id, {
                              duration: parseFloat(e.target.value) || 1,
                            })
                          }
                          className="w-10 bg-transparent text-[11px] font-mono text-cyan-300 text-center focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">s</span>
                      </div>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-0.5 pl-1 border-l border-white/10">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveLine(index, "up")}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Move Line Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === scene.dialogue.length - 1}
                          onClick={() => handleMoveLine(index, "down")}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                          title="Move Line Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLine(line.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="Delete Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dialogue Line Text */}
                  <textarea
                    rows={2}
                    value={line.text}
                    onChange={(e) =>
                      handleUpdateLine(line.id, { text: e.target.value })
                    }
                    placeholder={`Write dialogue line for ${char?.name || "character"}...`}
                    className="w-full bg-surface-panel/90 text-white placeholder:text-slate-500 border border-white/10 rounded-xl px-3.5 py-2 text-sm leading-relaxed focus:outline-none focus:border-violet-500"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
