"use client";

import * as React from "react";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Clock,
  Film,
  MessageSquare,
  Users,
  Lightbulb,
} from "lucide-react";
import { Character, Scene, Script, ScriptStatus } from "@/lib/types";
import { SCRIPT_STATUS_CONFIG, SCRIPT_STATUS_LABELS } from "@/lib/constants";
import { calculateScriptRuntime } from "@/lib/roster-script-utils";
import { SceneNavList } from "./SceneNavList";
import { DialogueList } from "./DialogueList";
import { ScriptCastInspector } from "./ScriptCastInspector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface ScriptEditorProps {
  script: Script;
  characters: Character[];
  onBack: () => void;
  onSaveScript: (updatedScript: Script) => void;
}

export function ScriptEditor({
  script,
  characters,
  onBack,
  onSaveScript,
}: ScriptEditorProps) {
  const [currentScript, setCurrentScript] = React.useState<Script>(script);
  const [activeSceneId, setActiveSceneId] = React.useState<string>(
    script.scenes[0]?.id || ""
  );

  // Mobile active tab: 'scenes' | 'dialogue' | 'cast'
  const [mobileTab, setMobileTab] = React.useState<"scenes" | "dialogue" | "cast">(
    "dialogue"
  );

  // Sync state if script prop changes
  React.useEffect(() => {
    setCurrentScript(script);
    if (!script.scenes.some((s) => s.id === activeSceneId)) {
      setActiveSceneId(script.scenes[0]?.id || "");
    }
  }, [script, activeSceneId]);

  // Find active scene
  const activeScene =
    currentScript.scenes.find((s) => s.id === activeSceneId) ||
    currentScript.scenes[0];

  // Helper to commit changes and recalculate duration
  const updateScriptState = (updated: Script) => {
    const runtime = calculateScriptRuntime(updated.scenes);
    const withDuration: Script = {
      ...updated,
      estimatedDuration: runtime.totalDuration,
      updatedAt: new Date().toISOString(),
    };
    setCurrentScript(withDuration);
    onSaveScript(withDuration);
  };

  // Scene handlers
  const handleUpdateScene = (updatedScene: Scene) => {
    const updatedScenes = currentScript.scenes.map((s) =>
      s.id === updatedScene.id ? updatedScene : s
    );
    updateScriptState({
      ...currentScript,
      scenes: updatedScenes,
    });
  };

  const handleAddScene = () => {
    const newSceneIndex = currentScript.scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${newSceneIndex}: Development`,
      description: "Describe scene action and camera perspective...",
      duration: 15,
      dialogue: [],
      characters: [],
      notes: "",
    };

    const updatedScenes = [...currentScript.scenes, newScene];
    setActiveSceneId(newScene.id);
    updateScriptState({
      ...currentScript,
      scenes: updatedScenes,
    });
    setMobileTab("dialogue");
  };

  const handleDeleteScene = (sceneId: string) => {
    if (currentScript.scenes.length <= 1) return;
    const filteredScenes = currentScript.scenes.filter((s) => s.id !== sceneId);
    if (activeSceneId === sceneId) {
      setActiveSceneId(filteredScenes[0].id);
    }
    updateScriptState({
      ...currentScript,
      scenes: filteredScenes,
    });
  };

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentScript.scenes.length) return;

    const list = [...currentScript.scenes];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    updateScriptState({
      ...currentScript,
      scenes: list,
    });
  };

  const handleAdvanceStatus = (nextStatus: ScriptStatus) => {
    updateScriptState({
      ...currentScript,
      status: nextStatus,
    });
  };

  const handleHookChange = (newHook: string) => {
    updateScriptState({
      ...currentScript,
      hook: newHook,
    });
  };

  const statusStyle =
    SCRIPT_STATUS_CONFIG[currentScript.status] || SCRIPT_STATUS_CONFIG.DRAFT;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-300 hover:text-white gap-1.5 h-8 px-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Library</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-sm sm:max-w-md">
                {currentScript.title}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  statusStyle.bg,
                  statusStyle.text
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                {SCRIPT_STATUS_LABELS[currentScript.status]}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Roblox Screenplay & Voice Acting Studio
            </p>
          </div>
        </div>

        {/* Mobile View Toggle Bar */}
        <div className="flex lg:hidden items-center bg-surface-panel p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setMobileTab("scenes")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1",
              mobileTab === "scenes"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Scenes ({currentScript.scenes.length})</span>
          </button>
          <button
            onClick={() => setMobileTab("dialogue")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1",
              mobileTab === "dialogue"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Dialogue</span>
          </button>
          <button
            onClick={() => setMobileTab("cast")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1",
              mobileTab === "cast"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cast & Runtime</span>
          </button>
        </div>
      </div>

      {/* Prominent Hook Editor Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-4 border border-violet-500/20 bg-gradient-to-r from-violet-950/30 via-surface-panel to-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                Video Opening Hook (3s Retention Anchor)
              </span>
              <span className="text-xs text-slate-400">
                The critical opening phrase that grabs viewer attention before swipe.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{currentScript.hook?.length || 0} characters</span>
          </div>
        </div>

        <div className="mt-2.5">
          <Input
            value={currentScript.hook || ""}
            onChange={(e) => handleHookChange(e.target.value)}
            placeholder="e.g. The sheriff looked into my eyes... and shot the guy eating cheese."
            className="bg-surface-canvas/90 font-medium text-sm text-cyan-200 border-violet-500/30 focus:border-cyan-400 h-10"
          />
        </div>
      </div>

      {/* 3-Pane Studio Layout (Desktop) / Tabbed (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        {/* LEFT PANE: Scene Navigation (3 cols) */}
        <div
          className={cn(
            "lg:col-span-3",
            mobileTab !== "scenes" && "hidden lg:block"
          )}
        >
          <SceneNavList
            scenes={currentScript.scenes}
            activeSceneId={activeSceneId}
            onSelectScene={(id) => {
              setActiveSceneId(id);
              setMobileTab("dialogue");
            }}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onMoveSceneUp={(idx) => handleMoveScene(idx, "up")}
            onMoveSceneDown={(idx) => handleMoveScene(idx, "down")}
          />
        </div>

        {/* CENTER PANE: Dialogue Stream Editor (6 cols) */}
        <div
          className={cn(
            "lg:col-span-6",
            mobileTab !== "dialogue" && "hidden lg:block"
          )}
        >
          {activeScene ? (
            <DialogueList
              scene={activeScene}
              characters={characters}
              onUpdateScene={handleUpdateScene}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">
              No active scene selected.
            </div>
          )}
        </div>

        {/* RIGHT PANE: Cast & Runtime Inspector (3 cols) */}
        <div
          className={cn(
            "lg:col-span-3",
            mobileTab !== "cast" && "hidden lg:block"
          )}
        >
          <ScriptCastInspector
            script={currentScript}
            characters={characters}
            onUpdateScript={updateScriptState}
            onAdvanceStatus={handleAdvanceStatus}
          />
        </div>
      </div>
    </div>
  );
}
