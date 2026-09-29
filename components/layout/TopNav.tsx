"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  Youtube,
  Radio,
  ExternalLink,
} from "lucide-react";
import { MAIN_NAV_ITEMS, DEFAULT_CREATOR } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TopNavProps {
  onOpenMobileMenu: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const pathname = usePathname();

  // Find active navigation item metadata
  const currentNav = MAIN_NAV_ITEMS.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  ) || {
    title: "ROXIE HUB",
    description: "Roblox Creator Management Platform",
  };

  return (
    <header className="h-16 w-full bg-surface-panel/80 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between gap-4 z-20 sticky top-0">
      {/* Left: Mobile hamburger & route heading */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden text-slate-300 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-none">
              {currentNav.title}
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-md">
            {currentNav.description}
          </p>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Input
            placeholder="Search ideas, videos, scripts, characters... (Ctrl + K)"
            icon={<Search className="w-4 h-4" />}
            className="h-9 text-xs bg-surface-canvas/90"
            disabled
          />
          <kbd className="absolute right-2.5 top-2 pointer-events-none text-[10px] font-mono text-slate-400 bg-surface-elevated px-1.5 py-0.5 rounded border border-white/10">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, platform indicators, notifications & profile */}
      <div className="flex items-center gap-3">
        {/* Connected Platform status */}
        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="crimson" size="sm" className="gap-1 cursor-default">
            <Youtube className="w-3 h-3 text-red-400" />
            <span>YT Linked</span>
          </Badge>

          <Badge variant="neon" size="sm" className="gap-1 cursor-default">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Roblox Sync</span>
          </Badge>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-slate-300 hover:text-white relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-surface-panel" />
          </Button>
        </div>

        {/* Creator Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEFAULT_CREATOR.avatarUrl}
              alt={DEFAULT_CREATOR.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
              {DEFAULT_CREATOR.name}
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {DEFAULT_CREATOR.handle}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
