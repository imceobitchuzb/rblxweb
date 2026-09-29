import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neon" | "purple" | "emerald" | "amber" | "crimson" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  const variantStyles = {
    default: "bg-surface-elevated text-slate-300 border border-white/5",
    neon: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30",
    purple: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    crimson: "bg-red-500/10 text-red-300 border border-red-500/30",
    outline: "bg-transparent text-slate-400 border border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full uppercase transition-colors select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
