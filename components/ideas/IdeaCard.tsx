"use client";

import * as React from "react";
import {
  Sparkles,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Flame,
} from "lucide-react";
import { IdeaItem, IdeaStatus } from "@/lib/types";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/constants";
import { getNextStatus } from "@/lib/ideas-utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: IdeaItem;
  viewMode?: "grid" | "kanban";
  onSelect: (idea: IdeaItem) => void;
  onEdit: (idea: IdeaItem) => void;
  onDelete: (idea: IdeaItem) => void;
  onAdvanceStatus?: (idea: IdeaItem, nextStatus: IdeaStatus) => void;
}

export function IdeaCard({
  idea,
  viewMode = "grid",
  onSelect,
  onEdit,
  onDelete,
  onAdvanceStatus,
}: IdeaCardProps) {
  const categoryStyle = CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.OTHER;
  const statusStyle = STATUS_COLORS[idea.status] || STATUS_COLORS.IDEA;
  const priorityStyle = PRIORITY_CONFIG[idea.priority];
  const nextStatus = getNextStatus(idea.status);

  const formattedDate = new Date(idea.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      variant="interactive"
      className={cn(
        "group flex flex-col justify-between transition-all duration-200 border-white/[0.06] hover:border-violet-500/40",
        viewMode === "kanban" ? "p-3.5 space-y-3 bg-surface-card/90" : "p-5 space-y-4"
      )}
      onClick={() => onSelect(idea)}
    >
      {/* Top Meta: Category + Priority + Score */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
              categoryStyle.bg,
              categoryStyle.text,
              categoryStyle.border
            )}
          >
            {CATEGORY_LABELS[idea.category]}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Priority Badge */}
            <Badge
              variant={priorityStyle.badgeVariant}
              size="sm"
              className={cn(
                "text-[10px] font-bold",
                idea.priority === "HOT" && "shadow-[0_0_12px_rgba(255,46,99,0.35)]"
              )}
            >
              {priorityStyle.label}
            </Badge>

            {/* Potential Score */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-surface-elevated text-slate-300 border border-white/5",
                idea.potentialScore >= 9 && "text-cyan-300 border-cyan-500/20"
              )}
              title="Potential Viral Score (1-10)"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {idea.potentialScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4
          className={cn(
            "font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-2",
            viewMode === "kanban" ? "text-sm" : "text-base"
          )}
        >
          {idea.title}
        </h4>

        {/* Description */}
        <p
          className={cn(
            "text-xs text-slate-400 mt-1.5 leading-relaxed",
            viewMode === "kanban" ? "line-clamp-2" : "line-clamp-3"
          )}
        >
          {idea.description}
        </p>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.05]"
              >
                #{tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Status & Action Buttons */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {viewMode === "grid" && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                statusStyle.bg,
                statusStyle.text
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
              {STATUS_LABELS[idea.status]}
            </span>
          )}

          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        {/* Quick action icons */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {nextStatus && onAdvanceStatus && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              title={`Advance to ${STATUS_LABELS[nextStatus]}`}
              onClick={() => onAdvanceStatus(idea, nextStatus)}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-white"
            title="Edit Idea"
            onClick={() => onEdit(idea)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title="Delete Idea"
            onClick={() => onDelete(idea)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
