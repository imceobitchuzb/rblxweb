"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardProps {
  label: string;
  value: string;
  secondaryMetric?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  accentColor?: "violet" | "cyan" | "emerald" | "amber";
}

export function AnalyticsKpiCard({
  label,
  value,
  secondaryMetric,
  icon: Icon,
  trend,
  accentColor = "violet",
}: AnalyticsKpiCardProps) {
  const colorStyles = {
    violet: {
      iconBg: "bg-violet-600/15 text-violet-400 border-violet-500/20",
      glow: "hover:border-violet-500/30",
    },
    cyan: {
      iconBg: "bg-cyan-600/15 text-cyan-400 border-cyan-500/20",
      glow: "hover:border-cyan-500/30",
    },
    emerald: {
      iconBg: "bg-emerald-600/15 text-emerald-400 border-emerald-500/20",
      glow: "hover:border-emerald-500/30",
    },
    amber: {
      iconBg: "bg-amber-600/15 text-amber-400 border-amber-500/20",
      glow: "hover:border-amber-500/30",
    },
  };

  const style = colorStyles[accentColor];

  return (
    <div
      className={cn(
        "p-5 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08] transition-all duration-300 space-y-3 shadow-sm",
        style.glow
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border",
            style.iconBg
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
          {value}
        </p>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.04]">
          {secondaryMetric ? (
            <span className="text-slate-400 truncate">{secondaryMetric}</span>
          ) : (
            <span />
          )}

          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-bold font-mono px-1.5 py-0.5 rounded",
                trend.isNeutral
                  ? "bg-slate-800 text-slate-300"
                  : trend.isPositive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
              )}
            >
              {trend.isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
