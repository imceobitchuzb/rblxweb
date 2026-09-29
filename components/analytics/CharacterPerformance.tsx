"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Eye, ExternalLink, Heart, MessageCircle } from "lucide-react";
import { CharacterAnalytics } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import {
  formatCompactNumber,
  formatNumber,
  formatPercent,
} from "@/lib/analytics-utils";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CharacterPerformanceProps {
  characters: CharacterAnalytics[];
}

export function CharacterPerformance({ characters }: CharacterPerformanceProps) {
  if (characters.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] text-center space-y-2">
        <Users className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">Character Roster Engagement</h4>
        <p className="text-xs text-slate-500">
          No published video appearances found for characters in this timeframe.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Character Cast Performance ({characters.length})
          </h3>
        </div>
        <Link
          href="/characters"
          className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1"
        >
          <span>Character Roster</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid of Character Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {characters.map((char) => {
          const roleStyle = ROLE_CONFIG[char.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.NPC;

          return (
            <Link
              key={char.characterId}
              href={`/characters?search=${encodeURIComponent(char.name)}`}
              className="group block"
            >
              <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 hover:border-violet-500/30 transition-all space-y-3">
                {/* Character header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {char.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 block">
                        {char.appearances} {char.appearances === 1 ? "video" : "videos"}
                      </span>
                    </div>
                  </div>

                  <Badge variant={roleStyle.badgeVariant} size="sm">
                    {roleStyle.label}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04] text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Total Views</span>
                    <span className="font-bold text-white font-mono">
                      {formatCompactNumber(char.totalViews)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Avg Views</span>
                    <span className="font-bold text-slate-300 font-mono">
                      {formatCompactNumber(char.averageViews)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Engagement</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatPercent(char.averageEngagementRate)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
