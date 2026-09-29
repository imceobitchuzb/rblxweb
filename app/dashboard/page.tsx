import Link from "next/link";
import {
  Sparkles,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Video,
  FileText,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEFAULT_CREATOR, MAIN_NAV_ITEMS } from "@/lib/constants";

export default function DashboardPlaceholderPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-violet-950/40 via-surface-panel to-indigo-950/30">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">
                Phase 1 Active
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                ROXIE HUB v0.1.0
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">ROXIE HUB</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Roblox creator operating system: stream ideas, write scripts, direct characters, coordinate publishing, and analyze video growth.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-surface-elevated/80 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                  Streak Status
                </p>
                <p className="text-sm font-extrabold text-white">
                  {DEFAULT_CREATOR.streakDays} Days Consistent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Platform Modules
            </h3>
            <p className="text-xs text-slate-400">
              Navigation routes initialized for Phase 1. Select any module to preview its architecture.
            </p>
          </div>
          <Badge variant="neon" size="sm">
            8 Routes Mounted
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MAIN_NAV_ITEMS.filter((item) => item.href !== "/dashboard").map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="group">
                <Card
                  variant="interactive"
                  glow="purple"
                  className="h-full p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-violet-400 mb-3 group-hover:scale-110 transition-transform border border-white/5">
                      <Icon className="w-5 h-5 text-violet-300" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {module.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-violet-300">
                    <span>Inspect route</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Architecture Readiness Card */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <CardTitle>Phase 1 Architectural Foundations</CardTitle>
          </div>
          <Badge variant="emerald" size="sm">
            Verified
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                <Layers className="w-4 h-4 text-violet-400" />
                Frontend Core
              </div>
              <p className="text-slate-400">
                Next.js App Router with TypeScript strict mode, Tailwind CSS dark gaming design tokens, and modular UI primitives.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Database Schema
              </div>
              <p className="text-slate-400">
                Prisma ORM schema configured for PostgreSQL with models for Ideas, Videos, Scripts, Scenes, Characters, and Calendar.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-canvas/60 border border-white/5">
              <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Responsive Shell
              </div>
              <p className="text-slate-400">
                Adaptive layout with desktop sidebar, mobile drawer, creator profile status, and keyboard-friendly navigation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
