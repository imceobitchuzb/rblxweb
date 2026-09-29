import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "panel" | "elevated" | "interactive";
  glow?: "none" | "cyan" | "purple";
}

export function Card({
  className,
  variant = "glass",
  glow = "none",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    glass: "glass-card rounded-2xl",
    panel: "glass-panel rounded-2xl",
    elevated: "bg-surface-elevated border border-surface-border rounded-2xl",
    interactive:
      "glass-card rounded-2xl hover:border-violet-500/40 hover:scale-[1.008] cursor-pointer transition-all duration-200",
  };

  const glowStyles = {
    none: "",
    cyan: "hover:shadow-[0_0_25px_-5px_rgba(0,240,255,0.2)]",
    purple: "hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.25)]",
  };

  return (
    <div
      className={cn(variantStyles[variant], glowStyles[glow], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 pb-3 flex items-center justify-between border-b border-white/[0.04]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-slate-100 tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-5 pt-3 border-t border-white/[0.04] flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
