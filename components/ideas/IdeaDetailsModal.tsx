"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  Tag,
  FileText,
} from "lucide-react";
import { IdeaItem, IdeaStatus } from "@/lib/types";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_PROGRESSION,
} from "@/lib/constants";
import { getNextStatus } from "@/lib/ideas-utils";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface IdeaDetailsModalProps {
  idea: IdeaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (idea: IdeaItem) => void;
  onDelete: (idea: IdeaItem) => void;
  onAdvanceStatus: (idea: IdeaItem, nextStatus: IdeaStatus) => void;
}

export function IdeaDetailsModal({
  idea,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAdvanceStatus,
}: IdeaDetailsModalProps) {
  if (!idea) return null;

  const categoryStyle = CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.OTHER;
  const statusStyle = STATUS_COLORS[idea.status] || STATUS_COLORS.IDEA;
  const priorityStyle = PRIORITY_CONFIG[idea.priority];
  const nextStatus = getNextStatus(idea.status);

  const createdFormatted = new Date(idea.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedFormatted = new Date(idea.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const currentStatusIndex = STATUS_PROGRESSION.indexOf(idea.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Idea Specification</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
              categoryStyle.bg,
              categoryStyle.text,
              categoryStyle.border
            )}
          >
            {CATEGORY_LABELS[idea.category]}
          </span>
        </div>
      }
      description={`ID: ${idea.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Main Title & Viral Score */}
        <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {idea.title}
            </h2>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-white/10 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div className="text-right">
                <span className="text-xs uppercase text-slate-400 font-bold block leading-none">
                  Viral Score
                </span>
                <span className="text-sm font-black text-white">
                  {idea.potentialScore.toFixed(1)} / 10
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap pt-1">
            {idea.description}
          </p>
        </div>

        {/* Status Pipeline Progress Tracker */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Pipeline Progression
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {STATUS_PROGRESSION.map((st, index) => {
              const isPast = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isFuture = index > currentStatusIndex;

              return (
                <div
                  key={st}
                  className={cn(
                    "p-2 rounded-xl text-center border transition-all text-xs flex flex-col items-center justify-center gap-1",
                    isCurrent &&
                      "bg-violet-600/20 border-violet-500 text-white font-bold shadow-neon-purple/20",
                    isPast && "bg-white/[0.03] border-emerald-500/30 text-emerald-300",
                    isFuture && "bg-surface-canvas/40 border-white/5 text-slate-400"
                  )}
                >
                  <span className="text-[10px] font-mono opacity-60">
                    Step {index + 1}
                  </span>
                  <span className="text-[11px] font-semibold truncate w-full">
                    {STATUS_LABELS[st]}
                  </span>
                  {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-canvas/50 border border-white/5">
            <span className="text-slate-400 block mb-1">Priority</span>
            <Badge variant={priorityStyle.badgeVariant} size="sm">
              {priorityStyle.label}
            </Badge>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/50 border border-white/5">
            <span className="text-slate-400 block mb-1">Current Status</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                statusStyle.bg,
                statusStyle.text
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
              {STATUS_LABELS[idea.status]}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/50 border border-white/5">
            <span className="text-slate-400 block mb-1">Created At</span>
            <span className="text-slate-200 font-mono text-[11px]">
              {createdFormatted}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-canvas/50 border border-white/5">
            <span className="text-slate-400 block mb-1">Last Updated</span>
            <span className="text-slate-200 font-mono text-[11px]">
              {updatedFormatted}
            </span>
          </div>
        </div>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Classification Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-surface-elevated text-slate-300 text-xs border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(idea);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="crimson"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(idea);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>

            <Link href="/scripts" onClick={onClose}>
              <Button variant="outline" size="sm" className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10">
                <FileText className="w-3.5 h-3.5" />
                <span>Script Studio</span>
              </Button>
            </Link>
          </div>

          <div>
            {nextStatus ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onAdvanceStatus(idea, nextStatus);
                  onClose();
                }}
              >
                <span>Move to {STATUS_LABELS[nextStatus]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Idea is in final archived state
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
