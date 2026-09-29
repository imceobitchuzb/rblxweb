import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import Link from "next/link";

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  badge?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  badge,
  className,
}: EmptyStateProps) {
  return (
    <Card variant="glass" className={cn("text-center py-12 px-6", className)}>
      <CardContent className="flex flex-col items-center max-w-md mx-auto p-0">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mb-5 text-violet-400 shadow-neon-purple/20">
          <Icon className="w-8 h-8 text-violet-300" />
        </div>

        {badge && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40 mb-3">
            {badge}
          </span>
        )}

        <h3 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">
          {title}
        </h3>

        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {description}
        </p>

        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button variant="primary">
              {actionLabel}
            </Button>
          </Link>
        )}

        {actionLabel && onAction && !actionHref && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
