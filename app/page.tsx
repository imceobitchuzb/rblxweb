"use client";

import * as React from "react";
import Link from "next/link";
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  Lightbulb,
  FileText,
  Users,
  Video as VideoIcon,
  Calendar,
  BarChart3,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Eye,
  ShieldCheck,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DEFAULT_CREATOR } from "@/lib/constants";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Ideas Hub",
    tagline: "Brainstorm & Score",
    description: "Capture raw concepts, rate viral potential scores, assign tags, and organize into Grid or Kanban pipelines.",
    href: "/ideas",
    icon: Lightbulb,
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    step: "02",
    title: "Script Studio",
    tagline: "3-Pane Screenplay Editor",
    description: "Write scene-by-scene scripts, craft retention hooks, assign character lines with 8 emotion cues, and monitor runtime live.",
    href: "/scripts",
    icon: FileText,
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    step: "03",
    title: "Video Studio",
    tagline: "Multi-Platform Packaging",
    description: "Manage video assets for YouTube, Shorts, TikTok, and Reels. Link screenplays, assign cast, and track thumbnail metadata.",
    href: "/videos",
    icon: VideoIcon,
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    step: "04",
    title: "Content Calendar",
    tagline: "Upload Timetable & Streaks",
    description: "Coordinate releases with Month and Week timeline views. Plan drops, live stream premieres, and protect creator streaks.",
    href: "/calendar",
    icon: Calendar,
    badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  },
  {
    step: "05",
    title: "Creator Analytics",
    tagline: "Growth Intelligence",
    description: "Understand catalog performance with views over time, engagement rate tracking, platform breakdowns, and character metrics.",
    href: "/analytics",
    icon: BarChart3,
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

const FEATURES_GRID = [
  {
    title: "Ideas Studio",
    description: "Categorize MM2 skits, challenges, and trending audio with 1–10 viral potential rating gauges.",
    href: "/ideas",
    icon: Lightbulb,
    metric: "18 Sample Ideas",
  },
  {
    title: "Character Roster",
    description: "Roblox persona library with archetypes (Sheriff, Murderer, Noob), outfits, and personality notes.",
    href: "/characters",
    icon: Users,
    metric: "10 Avatars",
  },
  {
    title: "Script Studio",
    description: "Structured screenplay studio with automatic runtime calculation, scene navigation, and character emotions.",
    href: "/scripts",
    icon: FileText,
    metric: "5 Full Scripts",
  },
  {
    title: "Video Studio",
    description: "Package vertical and landscape videos with views, likes, and one-click script conversion.",
    href: "/videos",
    icon: VideoIcon,
    metric: "14 Video Assets",
  },
  {
    title: "Content Calendar",
    description: "Visual scheduling timetable with Month and Week views to guarantee upload consistency.",
    href: "/calendar",
    icon: Calendar,
    metric: "11 Scheduled Slots",
  },
  {
    title: "Creator Analytics",
    description: "Derived metrics, views over time curves, engagement percentages, and factual dataset insights.",
    href: "/analytics",
    icon: BarChart3,
    metric: "58 Tests Passing",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-16 py-6 pb-20 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 bg-gradient-to-br from-violet-950/40 via-surface-panel to-indigo-950/40 text-center">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>The Modern Creator Operating System for Roblox</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            ROXIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300">HUB</span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-300">
              Creator Command Center
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From viral Murder Mystery 2 skits to full episodic animations: stream ideas, direct characters, write dialogue scripts, coordinate upload drops, and track channel growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="shadow-lg shadow-violet-600/30 gap-2">
                <span>Open Creator Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a href="#workflow">
              <Button variant="outline" size="lg" className="gap-2">
                <span>Explore Workflow</span>
              </Button>
            </a>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-2xl font-black text-white font-mono block">58</span>
              <span className="text-xs text-slate-400">Passing Tests</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono block">10</span>
              <span className="text-xs text-slate-400">Roblox Characters</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono block">14</span>
              <span className="text-xs text-slate-400">Days Streak</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono block">100%</span>
              <span className="text-xs text-slate-400">TypeScript Strict</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Product Preview Section */}
      <section className="space-y-4">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Built Specifically for Roblox Creators
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A real, production-ready workspace engineered with Next.js App Router, Tailwind CSS, and strict TypeScript.
          </p>
        </div>

        {/* Live UI Mock Preview Container */}
        <div className="rounded-3xl glass-panel bg-surface-panel/90 border border-white/[0.08] p-4 sm:p-6 shadow-2xl space-y-4 overflow-hidden">
          {/* Simulated App Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-slate-400 ml-2">roxie-hub://studio-preview</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400">Phase 5.5 Verified</span>
          </div>

          {/* Simulated Workflow Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase">1. Ideas</span>
              <p className="font-bold text-white">18 Concepts</p>
              <span className="text-[10px] text-slate-400">MM2, Skits, Trends</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-purple-400 font-bold block uppercase">2. Scripts</span>
              <p className="font-bold text-white">5 Screenplays</p>
              <span className="text-[10px] text-slate-400">Dialogue & Emotions</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase">3. Videos</span>
              <p className="font-bold text-white">14 Assets</p>
              <span className="text-[10px] text-slate-400">Shorts & Long Form</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1">
              <span className="text-[10px] text-indigo-400 font-bold block uppercase">4. Calendar</span>
              <p className="font-bold text-white">11 Slots</p>
              <span className="text-[10px] text-slate-400">Timetable Drops</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-canvas/80 border border-white/5 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase">5. Analytics</span>
              <p className="font-bold text-white">3.4M+ Views</p>
              <span className="text-[10px] text-slate-400">Audience Retention</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Workflow Section */}
      <section id="workflow" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              The Roblox Creator Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connected stages that turn a raw concept into a published, high-performing video.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            IDEA → SCRIPT → VIDEO → CALENDAR → ANALYTICS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {WORKFLOW_STEPS.map((wf) => {
            const Icon = wf.icon;
            return (
              <Link key={wf.step} href={wf.href} className="group">
                <div className="h-full p-4 rounded-2xl glass-panel bg-surface-panel/80 border border-white/5 group-hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {wf.step}
                      </span>
                      <div className={`p-1.5 rounded-lg border ${wf.badgeColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {wf.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {wf.tagline}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Complete Studio Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered as modular micro-applications sharing strongly-typed local domain models.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES_GRID.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.title} href={feat.href} className="group">
                <Card
                  variant="interactive"
                  glow="purple"
                  className="h-full p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-violet-400 border border-white/5 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-violet-300" />
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {feat.metric}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400 group-hover:text-violet-300 transition-colors font-medium">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Portfolio Callout & GitHub Link */}
      <section className="p-8 rounded-3xl glass-panel bg-gradient-to-r from-violet-950/40 via-surface-panel to-cyan-950/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Badge variant="purple" size="sm">
              Open Source Portfolio
            </Badge>
            <span className="text-xs text-slate-400 font-mono">Next.js 14 • Strict TS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Ready to inspect the codebase?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Clone the repository, inspect the architecture diagrams, and run the 58 automated unit tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="https://github.com/imceobitchuzb/rblxweb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              <span>GitHub Repo</span>
            </Button>
          </a>

          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="gap-2">
              <span>Go to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
