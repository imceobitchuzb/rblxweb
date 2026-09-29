"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  LayoutDashboard,
  Lightbulb,
  Users,
  FileText,
  Video as VideoIcon,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Search,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const commands: CommandItem[] = React.useMemo(() => {
    return [
      // Navigation
      {
        id: "nav-dash",
        category: "Navigation",
        title: "Go to Dashboard",
        subtitle: "Studio overview, stats & recent videos",
        icon: LayoutDashboard,
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-ideas",
        category: "Navigation",
        title: "Go to Ideas Hub",
        subtitle: "Brainstorm, organize & track content concepts",
        icon: Lightbulb,
        action: () => router.push("/ideas"),
      },
      {
        id: "nav-chars",
        category: "Navigation",
        title: "Go to Character Roster",
        subtitle: "Roblox avatars, personalities & script roles",
        icon: Users,
        action: () => router.push("/characters"),
      },
      {
        id: "nav-scripts",
        category: "Navigation",
        title: "Go to Script Studio",
        subtitle: "Screenplay editor, dialogue & scene runtime",
        icon: FileText,
        action: () => router.push("/scripts"),
      },
      {
        id: "nav-videos",
        category: "Navigation",
        title: "Go to Video Studio",
        subtitle: "Manage video assets across YT, Shorts, TikTok",
        icon: VideoIcon,
        action: () => router.push("/videos"),
      },
      {
        id: "nav-cal",
        category: "Navigation",
        title: "Go to Content Calendar",
        subtitle: "Release timetable & scheduled upload drops",
        icon: Calendar,
        action: () => router.push("/calendar"),
      },
      {
        id: "nav-analytics",
        category: "Navigation",
        title: "Go to Content Analytics",
        subtitle: "Views, engagement rates & channel benchmarks",
        icon: BarChart3,
        action: () => router.push("/analytics"),
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "Go to Settings",
        subtitle: "Profile, preferences & platform integrations",
        icon: Settings,
        action: () => router.push("/settings"),
      },

      // Actions
      {
        id: "act-create-idea",
        category: "Actions",
        title: "Create New Idea",
        subtitle: "Capture a fresh Roblox concept in Ideas Studio",
        icon: Plus,
        action: () => router.push("/ideas?create=true"),
      },
      {
        id: "act-create-script",
        category: "Actions",
        title: "Create New Screenplay",
        subtitle: "Start writing scene-by-scene script with cast",
        icon: Plus,
        action: () => router.push("/scripts?create=true"),
      },
      {
        id: "act-create-video",
        category: "Actions",
        title: "Create Video Asset",
        subtitle: "Package video metadata, platform & thumbnail",
        icon: Plus,
        action: () => router.push("/videos?create=true"),
      },
      {
        id: "act-create-char",
        category: "Actions",
        title: "Create Character",
        subtitle: "Add new Roblox avatar archetype to roster",
        icon: Plus,
        action: () => router.push("/characters?create=true"),
      },
      {
        id: "act-sched-video",
        category: "Actions",
        title: "Schedule Video Drop",
        subtitle: "Reserve an upload slot on the Content Calendar",
        icon: Calendar,
        action: () => router.push("/calendar?create=true"),
      },
    ];
  }, [router]);

  const filteredCommands = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  React.useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    }
  };

  const navCommands = filteredCommands.filter((c) => c.category === "Navigation");
  const actCommands = filteredCommands.filter((c) => c.category === "Actions");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Command className="w-4 h-4 text-violet-400" />
          <span>Command Palette</span>
        </div>
      }
      description="Quickly navigate or trigger studio actions"
      maxWidth="lg"
    >
      <div className="space-y-3" onKeyDown={handleKeyDown}>
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search (e.g. 'Videos', 'New Script')..."
            className="w-full bg-surface-canvas text-xs text-white placeholder:text-slate-500 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Command list */}
        <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
          {filteredCommands.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No matching commands found.
            </p>
          ) : (
            <>
              {/* Navigation Group */}
              {navCommands.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    Navigation
                  </span>
                  {navCommands.map((cmd) => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = cmd.icon;

                    return (
                      <div
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all",
                          isSelected
                            ? "bg-violet-600/20 border-violet-500/50 text-white font-semibold"
                            : "bg-surface-canvas/50 border-white/5 text-slate-300 hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {cmd.title}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {cmd.subtitle}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions Group */}
              {actCommands.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    Studio Actions
                  </span>
                  {actCommands.map((cmd) => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = cmd.icon;

                    return (
                      <div
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all",
                          isSelected
                            ? "bg-cyan-600/20 border-cyan-500/50 text-white font-semibold"
                            : "bg-surface-canvas/50 border-white/5 text-slate-300 hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {cmd.title}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {cmd.subtitle}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>↑ ↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
          </div>
          <span>esc to close</span>
        </div>
      </div>
    </Modal>
  );
}
