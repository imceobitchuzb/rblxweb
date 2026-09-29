"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Share2,
  KeyRound,
  ShieldCheck,
  Check,
  Save,
  Youtube,
  Radio,
  ExternalLink,
  Flame,
} from "lucide-react";
import { DEFAULT_CREATOR, ALL_VIDEO_PLATFORMS, PLATFORM_CONFIG } from "@/lib/constants";
import { VideoPlatform } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import {
  fetchUserSettingsAction,
  updateUserSettingsAction,
} from "@/app/actions/settings";

type SettingsTab = "profile" | "appearance" | "preferences" | "notifications" | "platforms";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  // Profile Form State
  const [name, setName] = React.useState(DEFAULT_CREATOR.name);
  const [handle, setHandle] = React.useState(DEFAULT_CREATOR.handle);
  const [robloxUsername, setRobloxUsername] = React.useState(DEFAULT_CREATOR.robloxUsername);
  const [primaryPlatform, setPrimaryPlatform] = React.useState<VideoPlatform>(
    DEFAULT_CREATOR.primaryPlatform
  );
  const [bio, setBio] = React.useState(
    "Roblox content creator focusing on Murder Mystery 2 comedic skits, trading challenges, and character animations."
  );

  // Preferences State
  const [weeklyUploadGoal, setWeeklyUploadGoal] = React.useState(3);
  const [notifyDeadlines, setNotifyDeadlines] = React.useState(true);
  const [notifyReadyScripts, setNotifyReadyScripts] = React.useState(true);
  const [neonGlow, setNeonGlow] = React.useState(true);

  // Saved Feedback
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetchUserSettingsAction();
      if (mounted && res.success) {
        setNotifyDeadlines(res.data.emailNotifications);
        setNotifyReadyScripts(res.data.browserNotifications);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserSettingsAction({
      emailNotifications: notifyDeadlines,
      browserNotifications: notifyReadyScripts,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const tabs = [
    { id: "profile" as SettingsTab, label: "Creator Profile", icon: User },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: SettingsIcon },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "platforms" as SettingsTab, label: "Connected Platforms", icon: Share2 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Settings & Configuration
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 uppercase tracking-wider">
              Studio Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Roblox creator profile, studio preferences, theme settings, and platform links.
          </p>
        </div>

        {isSaved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      {/* Main Container: Tabs Left + Content Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-violet-600/20 text-white font-bold border-l-2 border-violet-500"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-violet-400" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          <div className="p-6 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08]">
            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Creator Identity
                    </h3>
                    <p className="text-xs text-slate-400">
                      Public creator information displayed across ROXIE HUB.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEFAULT_CREATOR.avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Display Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Channel Handle</label>
                    <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Roblox Username</label>
                    <Input
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Primary Content Platform
                    </label>
                    <select
                      value={primaryPlatform}
                      onChange={(e) => setPrimaryPlatform(e.target.value as VideoPlatform)}
                      className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                    >
                      {ALL_VIDEO_PLATFORMS.map((plat) => (
                        <option key={plat} value={plat}>
                          {PLATFORM_CONFIG[plat].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Creator Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interface Theme & Aesthetics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize the ROXIE HUB gaming dark aesthetic.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Dark Gaming SaaS (Active)</span>
                      <Check className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tailwind tokens with deep canvas (#07090E), violet/cyan gradients, and glassmorphic panels.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-canvas/40 border border-white/5 opacity-60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Light Studio Mode</span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Coming Soon</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      High-contrast daylight theme for studio production monitors.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Neon Glow Effects</span>
                    <span className="text-slate-400 text-[11px]">
                      Enable pulsating glow rings on HOT ideas and streak counters.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNeonGlow((prev) => !prev)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative p-0.5",
                      neonGlow ? "bg-violet-600" : "bg-surface-elevated"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform",
                        neonGlow && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Preferences */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Content Production Targets
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set cadence targets and studio pacing benchmarks.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Weekly Upload Target (Videos / Week)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={weeklyUploadGoal}
                    onChange={(e) => setWeeklyUploadGoal(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-[11px] text-slate-500">
                    Current cadence: 14-day continuous consistency streak maintained.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Studio Notification Rules
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure deterministic in-app alerts and notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas/60 border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">Scheduled Drop Warnings</span>
                      <span className="text-[11px] text-slate-400">
                        Alert when a scheduled upload is approaching on the calendar.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDeadlines}
                      onChange={(e) => setNotifyDeadlines(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-500 bg-surface-canvas border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas/60 border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">Script Ready Alerts</span>
                      <span className="text-[11px] text-slate-400">
                        Notify when a screenplay completes review and is ready for production.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyReadyScripts}
                      onChange={(e) => setNotifyReadyScripts(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-500 bg-surface-canvas border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Connected Platforms */}
            {activeTab === "platforms" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    External Distribution & API Links
                  </h3>
                  <p className="text-xs text-slate-400">
                    OAuth channels and API synchronization endpoints.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-600/15 flex items-center justify-center text-red-400">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          YouTube Data API v3
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Automatic video metadata sync and real-time view counts.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 6+
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-600/15 flex items-center justify-center text-cyan-400">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Roblox Open Cloud API
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Avatar thumbnails, place analytics, and badge hooks.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 6+
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-600/15 flex items-center justify-center text-violet-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          TikTok Creator Account Sync
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Short-form video publishing direct to TikTok.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 6+
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
