"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Gamepad2,
  ChevronRight,
  Sparkles,
  Github,
  LayoutDashboard,
  Lightbulb,
  Users,
  FileText,
  Video as VideoIcon,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { DEFAULT_CREATOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const WORKSPACE_NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ideas Hub", href: "/ideas", icon: Lightbulb },
  { title: "Characters", href: "/characters", icon: Users },
  { title: "Script Studio", href: "/scripts", icon: FileText },
  { title: "Videos", href: "/videos", icon: VideoIcon },
  { title: "Content Calendar", href: "/calendar", icon: Calendar },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
];

const SYSTEM_NAV_ITEMS = [
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 h-full flex flex-col bg-surface-panel/95 backdrop-blur-xl border-r border-white/[0.06] select-none",
        className
      )}
    >
      {/* Brand Logo Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.06]">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-neon-purple transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-surface-canvas rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-wider text-white">
                ROXIE<span className="text-cyan-400">HUB</span>
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Roblox Creator Suite
            </p>
          </div>
        </Link>
      </div>

      {/* Creator Streak Banner */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                Upload Streak
              </p>
              <p className="text-sm font-extrabold text-white leading-tight">
                {DEFAULT_CREATOR.streakDays} Days Strong
              </p>
            </div>
          </div>
          <Badge variant="amber" size="sm">
            Active
          </Badge>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Workspace Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          {WORKSPACE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-transparent text-white border-l-2 border-violet-500 font-semibold shadow-inner shadow-violet-500/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive
                      ? "text-violet-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="flex-1 truncate">{item.title}</span>

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-violet-400 opacity-60 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>

        {/* System Section */}
        <div className="space-y-1 pt-2 border-t border-white/[0.04]">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System
          </div>

          {SYSTEM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-transparent text-white border-l-2 border-violet-500 font-semibold shadow-inner shadow-violet-500/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive
                      ? "text-violet-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="flex-1 truncate">{item.title}</span>

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-violet-400 opacity-60 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-surface-canvas/40 space-y-2">
        <div className="p-2.5 rounded-xl bg-surface-elevated/70 border border-white/5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">ROXIE HUB v1.0</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            Verified
          </span>
        </div>

        <a
          href="https://github.com/imceobitchuzb/rblxweb"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub Repository</span>
        </a>
      </div>
    </aside>
  );
}
