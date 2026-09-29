import {
  Settings,
  User,
  Palette,
  Bell,
  Share2,
  KeyRound,
  Shield,
  Sparkles,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const SETTINGS_SECTIONS = [
  {
    icon: User,
    name: "Creator Profile",
    desc: "Display name, avatar, bio, and Roblox creator tag.",
  },
  {
    icon: Palette,
    name: "Appearance",
    desc: "Dark gaming UI theme, neon intensity, and interface scaling.",
  },
  {
    icon: Bell,
    name: "Notifications",
    desc: "Upload reminders, streak preservation warnings, and comments.",
  },
  {
    icon: Share2,
    name: "Connected Platforms",
    desc: "YouTube API, TikTok Creator account, and Roblox OAuth.",
  },
  {
    icon: KeyRound,
    name: "API Integrations",
    desc: "Future AI assistant keys, analytics webhooks, and cloud backup.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Settings & Configuration
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your creator preferences, theme customization, and external service links.
          </p>
        </div>
      </div>

      {/* Blueprint Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Settings Architecture</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SETTINGS_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.name}
                  className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-white">
                      {sec.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={Settings}
        title="Settings Workspace Initialized"
        badge="Phase 1 Active"
        description="Configuration models, environment variable hooks (.env.example), and security parameters are staged for user profile setup."
      />
    </div>
  );
}
