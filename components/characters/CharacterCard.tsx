"use client";

import * as React from "react";
import { Users, Pencil, Trash2, Tag, Shirt } from "lucide-react";
import { Character } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
}

export function CharacterCard({
  character,
  onSelect,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const roleStyle = ROLE_CONFIG[character.role] || ROLE_CONFIG.NPC;

  return (
    <Card
      variant="interactive"
      className="p-5 flex flex-col justify-between space-y-4 group transition-all duration-200 border-white/[0.06] hover:border-violet-500/40"
      onClick={() => onSelect(character)}
    >
      <div>
        {/* Header: Avatar, Name & Role */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.avatar || character.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
              alt={character.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder avatar if image fails to load
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <Badge variant={roleStyle.badgeVariant} size="sm">
                {roleStyle.label}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors truncate">
              {character.name}
            </h4>
            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
              &ldquo;{character.personality}&rdquo;
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
          {character.description}
        </p>

        {/* Outfit Preview */}
        {character.outfit && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-surface-canvas/60 px-2.5 py-1.5 rounded-xl border border-white/5 mb-3">
            <Shirt className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{character.outfit}</span>
          </div>
        )}

        {/* Tags */}
        {character.tags && character.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {character.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.05]"
              >
                #{tag}
              </span>
            ))}
            {character.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{character.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
        <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium">
          View Dossier
        </span>

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-white"
            title="Edit Character"
            onClick={() => onEdit(character)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title="Delete Character"
            onClick={() => onDelete(character)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
