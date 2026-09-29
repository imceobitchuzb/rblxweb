"use client";

import * as React from "react";
import {
  FileText,
  Clock,
  Users,
  Film,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { Script } from "@/lib/types";
import { SCRIPT_STATUS_CONFIG, SCRIPT_STATUS_LABELS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ScriptCardProps {
  script: Script;
  onOpen: (script: Script) => void;
  onDelete: (script: Script) => void;
}

export function ScriptCard({ script, onOpen, onDelete }: ScriptCardProps) {
  const statusStyle =
    SCRIPT_STATUS_CONFIG[script.status] || SCRIPT_STATUS_CONFIG.DRAFT;

  const totalLines = script.scenes.reduce(
    (acc, scene) => acc + scene.dialogue.length,
    0
  );

  const formattedDate = new Date(script.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      variant="interactive"
      className="p-5 flex flex-col justify-between space-y-4 group transition-all duration-200 border-white/[0.06] hover:border-violet-500/40"
      onClick={() => onOpen(script)}
    >
      <div>
        {/* Top: Status & Runtime */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
              statusStyle.bg,
              statusStyle.text
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
            {SCRIPT_STATUS_LABELS[script.status]}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-surface-elevated text-cyan-300 border border-white/5 font-bold">
            <Clock className="w-3 h-3 text-cyan-400" />
            {formatDuration(script.estimatedDuration)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
          {script.title}
        </h4>

        {/* Hook */}
        {script.hook && (
          <p className="text-xs text-violet-300 italic line-clamp-1 mt-1 font-medium">
            &ldquo;{script.hook}&rdquo;
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {script.description}
        </p>

        {/* Idea Link indicator */}
        {script.ideaId && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400/90 font-medium mt-2.5">
            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Linked to Concept #{script.ideaId}</span>
          </div>
        )}
      </div>

      {/* Metrics & Actions */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1" title="Scenes count">
            <Film className="w-3.5 h-3.5 text-slate-400" />
            {script.scenes.length}
          </span>
          <span className="flex items-center gap-1" title="Dialogue lines count">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {totalLines}
          </span>
          <span className="flex items-center gap-1" title="Cast count">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {script.characters.length}
          </span>
        </div>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-red-400"
            title="Delete Script"
            onClick={() => onDelete(script)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            onClick={() => onOpen(script)}
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
