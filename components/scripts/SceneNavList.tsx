"use client";

import * as React from "react";
import {
  Film,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Scene } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SceneNavListProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneId: string) => void;
  onMoveSceneUp: (index: number) => void;
  onMoveSceneDown: (index: number) => void;
}

export function SceneNavList({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onMoveSceneUp,
  onMoveSceneDown,
}: SceneNavListProps) {
  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl border border-white/[0.06] bg-surface-panel/80 p-3.5 space-y-3">
      {/* Pane Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Scene Breakdown ({scenes.length})
          </h3>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          onClick={onAddScene}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Scene</span>
        </Button>
      </div>

      {/* Scenes List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          const isFirst = index === 0;
          const isLast = index === scenes.length - 1;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={cn(
                "group relative p-3 rounded-xl border transition-all cursor-pointer select-none",
                isActive
                  ? "bg-violet-600/15 border-violet-500/60 shadow-inner shadow-violet-500/5"
                  : "bg-surface-canvas/60 border-white/5 hover:border-white/20 hover:bg-surface-canvas/90"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h5
                      className={cn(
                        "text-xs font-bold truncate",
                        isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                      )}
                    >
                      {scene.title || `Scene ${index + 1}`}
                    </h5>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">
                    {scene.description || "No description"}
                  </p>
                </div>

                {/* Move & Delete controls */}
                <div
                  className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={isFirst}
                    onClick={() => onMoveSceneUp(index)}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move Scene Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => onMoveSceneDown(index)}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move Scene Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scene bottom pill metrics */}
              <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-cyan-400" />
                  {scene.dialogue.length} Lines
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-violet-400" />
                  {scene.duration}s
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
