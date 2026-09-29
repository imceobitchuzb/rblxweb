"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  Film,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Character, Script, ScriptStatus } from "@/lib/types";
import {
  ROLE_CONFIG,
  SCRIPT_STATUS_CONFIG,
  SCRIPT_STATUS_LABELS,
  SCRIPT_STATUS_PROGRESSION,
} from "@/lib/constants";
import {
  calculateScriptRuntime,
  getNextScriptStatus,
  resolveCharacter,
} from "@/lib/roster-script-utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ScriptCastInspectorProps {
  script: Script;
  characters: Character[];
  onUpdateScript: (updatedScript: Script) => void;
  onAdvanceStatus: (nextStatus: ScriptStatus) => void;
}

export function ScriptCastInspector({
  script,
  characters,
  onUpdateScript,
  onAdvanceStatus,
}: ScriptCastInspectorProps) {
  const [selectedNewCharId, setSelectedNewCharId] = React.useState("");

  const runtimeStats = calculateScriptRuntime(script.scenes);
  const nextStatus = getNextScriptStatus(script.status);
  const currentStatusIndex = SCRIPT_STATUS_PROGRESSION.indexOf(script.status);

  // Derive unique characters actively referenced in the script or scenes
  const allReferencedCharIds = Array.from(
    new Set([
      ...script.characters,
      ...runtimeStats.uniqueCharacters,
      ...script.scenes.flatMap((s) => s.characters),
    ])
  );

  const castMembers = allReferencedCharIds
    .map((id) => resolveCharacter(id, characters))
    .filter((c): c is Character => Boolean(c));

  // Characters not yet assigned to the script
  const unassignedCharacters = characters.filter(
    (c) => !allReferencedCharIds.includes(c.id)
  );

  const handleAddCastMember = () => {
    if (!selectedNewCharId) return;
    if (!script.characters.includes(selectedNewCharId)) {
      onUpdateScript({
        ...script,
        characters: [...script.characters, selectedNewCharId],
      });
    }
    setSelectedNewCharId("");
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl border border-white/[0.06] bg-surface-panel/80 p-4 space-y-5 overflow-y-auto">
      {/* Live Estimated Runtime Meter */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/40 via-surface-canvas/80 to-cyan-950/30 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Estimated Runtime
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white font-mono tracking-tight">
            {runtimeStats.formatted}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({runtimeStats.totalDuration.toFixed(1)}s)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Scenes</span>
            <span className="font-bold text-white">{runtimeStats.sceneCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Lines</span>
            <span className="font-bold text-white">{runtimeStats.dialogueCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Cast</span>
            <span className="font-bold text-white">{castMembers.length}</span>
          </div>
        </div>
      </div>

      {/* Production Pipeline Progress */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Pipeline Stage
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-canvas text-slate-300 font-semibold border border-white/5">
            {SCRIPT_STATUS_LABELS[script.status]}
          </span>
        </div>

        {/* Linear progress steps */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          {SCRIPT_STATUS_PROGRESSION.map((st, idx) => {
            const isPast = idx < currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <div
                key={st}
                className={cn(
                  "p-1.5 rounded-lg border text-center font-medium truncate",
                  isCurrent && "bg-violet-600/20 border-violet-500 text-white font-bold",
                  isPast && "bg-white/[0.02] border-emerald-500/30 text-emerald-300",
                  !isPast && !isCurrent && "bg-surface-canvas/40 border-white/5 text-slate-400"
                )}
              >
                {SCRIPT_STATUS_LABELS[st]}
              </div>
            );
          })}
        </div>

        {nextStatus && (
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => onAdvanceStatus(nextStatus)}
          >
            <span>Advance to {SCRIPT_STATUS_LABELS[nextStatus]}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}

        <Link
          href={`/videos?createFromScript=${script.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors"
        >
          <Film className="w-3.5 h-3.5 text-violet-400" />
          <span>Create Video Asset</span>
          <ArrowRight className="w-3 h-3 ml-auto text-violet-400" />
        </Link>
      </div>

      {/* Cast Roster in this Script */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Assigned Cast ({castMembers.length})</span>
          </div>

          <Link
            href="/characters"
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
          >
            <span>Roster</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Add Character to Cast Dropdown */}
        {unassignedCharacters.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedNewCharId}
              onChange={(e) => setSelectedNewCharId(e.target.value)}
              className="flex-1 bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
            >
              <option value="">+ Add Character to Cast</option>
              {unassignedCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedNewCharId}
              onClick={handleAddCastMember}
              className="h-8 px-2.5 text-xs"
            >
              Add
            </Button>
          </div>
        )}

        {/* Cast list items */}
        <div className="space-y-2">
          {castMembers.map((char) => {
            const roleStyle = ROLE_CONFIG[char.role] || ROLE_CONFIG.NPC;
            return (
              <div
                key={char.id}
                className="p-2.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={char.avatar || char.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                      alt={char.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {char.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {char.personality}
                    </p>
                  </div>
                </div>

                <Badge variant={roleStyle.badgeVariant} size="sm">
                  {roleStyle.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
