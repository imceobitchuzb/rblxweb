"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  Sparkles,
  Command,
  Flame,
  LogOut,
  Building2,
  ChevronDown,
} from "lucide-react";
import { MAIN_NAV_ITEMS, DEFAULT_CREATOR } from "@/lib/constants";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import { INITIAL_CALENDAR_EVENTS } from "@/lib/mock-calendar";
import { deriveWorkspaceNotifications, NotificationItem } from "@/lib/notification-utils";
import { Button } from "@/components/ui/Button";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { CommandPalette } from "@/components/command/CommandPalette";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

import { fetchVideosAction } from "@/app/actions/videos";
import { fetchScriptsAction } from "@/app/actions/scripts";
import { fetchIdeasAction } from "@/app/actions/ideas";
import { fetchCalendarEventsAction } from "@/app/actions/calendar";
import { getAuthSessionAction, logoutAction, AuthSessionResponse } from "@/app/actions/auth";

interface TopNavProps {
  onOpenMobileMenu: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const pathname = usePathname();

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [session, setSession] = React.useState<AuthSessionResponse | null>(null);

  React.useEffect(() => {
    getAuthSessionAction().then((res) => {
      if (res.success && res.data) {
        setSession(res.data);
      }
    });
  }, [pathname]);

  // Notifications state
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(() =>
    deriveWorkspaceNotifications(
      INITIAL_VIDEOS,
      INITIAL_SCRIPTS,
      INITIAL_IDEAS,
      INITIAL_CALENDAR_EVENTS
    )
  );

  // Refresh notifications dynamically from server data on route transition
  React.useEffect(() => {
    let mounted = true;
    async function refreshNotifications() {
      try {
        const [vRes, sRes, iRes, cRes] = await Promise.all([
          fetchVideosAction(),
          fetchScriptsAction(),
          fetchIdeasAction(),
          fetchCalendarEventsAction(),
        ]);
        if (mounted && vRes.success && sRes.success && iRes.success && cRes.success) {
          setNotifications(
            deriveWorkspaceNotifications(
              vRes.data,
              sRes.data,
              iRes.data,
              cRes.data
            )
          );
        }
      } catch {
        // retain fallback
      }
    }
    refreshNotifications();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

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
    <>
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

        {/* Center: Search trigger input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full h-9 rounded-xl bg-surface-canvas/90 hover:bg-surface-canvas text-xs text-slate-400 hover:text-slate-200 border border-white/10 px-3.5 flex items-center justify-between transition-all group shadow-sm focus:outline-none focus:border-cyan-500"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search ideas, scripts, characters, videos...</span>
            </span>
            <kbd className="text-[10px] font-mono text-slate-400 bg-surface-elevated px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-0.5">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, platform indicators, notifications & profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden w-8 h-8 rounded-xl bg-surface-panel/80 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Search studio"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="w-8 h-8 rounded-xl bg-surface-panel/80 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all focus:outline-none"
            title="Command Palette (Ctrl + K)"
            aria-label="Open command palette"
          >
            <Command className="w-4 h-4 text-violet-400" />
          </button>

          {/* Consistency Streak Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="font-bold">{DEFAULT_CREATOR.streakDays}d Streak</span>
          </div>

          {/* Notification Center */}
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {/* Creator Profile & Workspace Menu */}
          <div className="relative pl-2 border-l border-white/[0.08]">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left focus:outline-none"
              title="Account & Workspace"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10 bg-surface-elevated shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session?.user.avatarUrl || DEFAULT_CREATOR.avatarUrl}
                  alt={session?.user.name || DEFAULT_CREATOR.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {session?.user.name || DEFAULT_CREATOR.name}
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">
                  {session?.workspace.name || DEFAULT_CREATOR.handle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User info */}
                  <div className="px-3 py-2 border-b border-surface-800">
                    <p className="text-xs font-bold text-surface-100 leading-tight">
                      {session?.user.name || DEFAULT_CREATOR.name}
                    </p>
                    <p className="text-[11px] text-surface-400 font-mono truncate mt-0.5">
                      {session?.user.email || "roxie@bloxmedia.gg"}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-md font-semibold w-fit border border-brand-500/20">
                      <Building2 className="w-3 h-3" />
                      <span>{session?.workspace.name || "Roxie Velocity Studio"}</span>
                      <span className="opacity-60 text-[9px] uppercase font-mono">({session?.role || "OWNER"})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-surface-300 hover:text-surface-100 hover:bg-surface-800/60 rounded-xl transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-surface-400" />
                      <span>Studio Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-surface-800">
                    <button
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logoutAction();
                        window.location.href = "/login";
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-accent-rose hover:bg-accent-rose/10 rounded-xl transition-colors font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Keyboard Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}
