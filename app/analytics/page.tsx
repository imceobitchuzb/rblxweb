import { BarChart3, TrendingUp, Eye, ThumbsUp, MessageSquare, Percent } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ANALYTICS_METRICS = [
  { icon: Eye, label: "Total Views", desc: "Aggregate views across all published videos" },
  { icon: TrendingUp, label: "Average Views", desc: "Per-video baseline performance benchmark" },
  { icon: ThumbsUp, label: "Audience Likes", desc: "Viewer feedback and upvote volume" },
  { icon: MessageSquare, label: "Comments", desc: "Discussion and community interaction" },
  { icon: Percent, label: "Engagement Rate", desc: "(Likes + Comments) / Views ratio" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Content Analytics
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data insights, audience engagement curves, and growth benchmarks for your Roblox videos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neon" size="sm">
            Last 30 Days
          </Badge>
        </div>
      </div>

      {/* Blueprint Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Analytics Engine Specifications</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ANALYTICS_METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white block">
                    {m.label}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={BarChart3}
        title="Analytics Module Initialized"
        badge="Phase 1 Active"
        description="Metric calculation algorithms, time-series chart containers, and video performance breakdown tables are staged for Phase implementation."
      />
    </div>
  );
}
