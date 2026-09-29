"use client";

import * as React from "react";
import {
  Lightbulb,
  Flame,
  Clock,
  Film,
  CheckCircle2,
} from "lucide-react";
import { IdeaStats } from "@/lib/ideas-utils";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface IdeasStatsProps {
  stats: IdeaStats;
}

export function IdeasStats({ stats }: IdeasStatsProps) {
  const statItems = [
    {
      label: "Total Ideas",
      value: stats.total,
      icon: Lightbulb,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Hot Ideas",
      value: stats.hot,
      icon: Flame,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: stats.hot > 0,
    },
    {
      label: "In Planning",
      value: stats.planning,
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "In Production",
      value: stats.production,
      icon: Film,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            variant="glass"
            className={cn(
              "p-3.5 flex items-center justify-between border-white/[0.06] transition-all",
              item.glow && "border-rose-500/30 hover:shadow-[0_0_20px_-5px_rgba(255,46,99,0.25)]"
            )}
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {item.value}
              </p>
            </div>
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center border",
                item.bg,
                item.border,
                item.color
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
