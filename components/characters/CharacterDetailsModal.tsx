"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shirt,
  Tag,
  Calendar,
  Pencil,
  Trash2,
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Character, Script } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { getScriptsUsingCharacter } from "@/lib/roster-script-utils";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CharacterDetailsModalProps {
  character: Character | null;
  scripts: Script[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
  onNavigateToScript?: (scriptId: string) => void;
}

export function CharacterDetailsModal({
  character,
  scripts,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onNavigateToScript,
}: CharacterDetailsModalProps) {
  if (!character) return null;

  const roleStyle = ROLE_CONFIG[character.role] || ROLE_CONFIG.NPC;
  const relatedScripts = getScriptsUsingCharacter(character.id, scripts);

  const createdFormatted = new Date(character.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Character Dossier</span>
          <Badge variant={roleStyle.badgeVariant} size="sm">
            {roleStyle.label}
          </Badge>
        </div>
      }
      description={`ID: ${character.id}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header Profile with Avatar and Personality */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-surface-canvas/60 border border-white/5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-violet-500/30 bg-surface-elevated shrink-0 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.avatar || character.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-white tracking-tight">
              {character.name}
            </h2>
            <p className="text-xs text-cyan-300 italic font-medium">
              &ldquo;{character.personality}&rdquo;
            </p>
            {character.outfit && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 pt-1">
                <Shirt className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Outfit: {character.outfit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description & Backstory */}
        <div className="p-4 rounded-xl bg-surface-canvas/40 border border-white/5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Backstory & Roleplay Dynamics
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {character.description}
          </p>
        </div>

        {/* Studio / Voice Notes */}
        {character.notes && (
          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs">
            <span className="font-bold text-violet-300 block mb-1">
              Production & Voice Acting Cue:
            </span>
            <p className="text-slate-300">{character.notes}</p>
          </div>
        )}

        {/* Cross-Module Linked Scripts */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Used In Scripts ({relatedScripts.length})</span>
            </div>
          </div>

          {relatedScripts.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-canvas/50 border border-dashed border-white/5 text-center text-xs text-slate-400">
              No scripts currently feature this character. Add them to a scene in Script Studio!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedScripts.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-surface-canvas/70 border border-white/10 hover:border-violet-500/40 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {s.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {s.scenes.length} Scenes • {s.status}
                    </span>
                  </div>

                  {onNavigateToScript ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 group-hover:text-cyan-300"
                      onClick={() => {
                        onClose();
                        onNavigateToScript(s.id);
                      }}
                      title="Open in Script Studio"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Link
                      href={`/scripts?id=${s.id}`}
                      onClick={onClose}
                      className="text-slate-400 group-hover:text-cyan-300 p-1"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {character.tags && character.tags.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {character.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-surface-elevated text-slate-300 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(character);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Character</span>
            </Button>

            <Button
              variant="crimson"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(character);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>

          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Created {createdFormatted}
          </span>
        </div>
      </div>
    </Modal>
  );
}
