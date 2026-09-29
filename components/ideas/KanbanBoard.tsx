"use client";

import * as React from "react";
import { IdeaItem, IdeaStatus } from "@/lib/types";
import { ALL_STATUSES, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { IdeaCard } from "./IdeaCard";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  ideas: IdeaItem[];
  onSelect: (idea: IdeaItem) => void;
  onEdit: (idea: IdeaItem) => void;
  onDelete: (idea: IdeaItem) => void;
  onAdvanceStatus: (idea: IdeaItem, nextStatus: IdeaStatus) => void;
}

export function KanbanBoard({
  ideas,
  onSelect,
  onEdit,
  onDelete,
  onAdvanceStatus,
}: KanbanBoardProps) {
  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1200px] items-start">
        {ALL_STATUSES.map((status) => {
          const columnIdeas = ideas.filter((idea) => idea.status === status);
          const statusStyle = STATUS_COLORS[status];

          return (
            <div
              key={status}
              className="flex-1 min-w-[260px] max-w-[320px] rounded-2xl glass-panel p-3 bg-surface-panel/70 border border-white/[0.06] flex flex-col max-h-[calc(100vh-280px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", statusStyle.dot)} />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {STATUS_LABELS[status]}
                  </h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-slate-300 font-bold border border-white/5">
                  {columnIdeas.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {columnIdeas.length === 0 ? (
                  <div className="py-8 px-4 text-center rounded-xl border border-dashed border-white/5 text-[11px] text-slate-400">
                    No ideas in {STATUS_LABELS[status].toLowerCase()}
                  </div>
                ) : (
                  columnIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      viewMode="kanban"
                      onSelect={onSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAdvanceStatus={onAdvanceStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
