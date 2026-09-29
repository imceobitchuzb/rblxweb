import { Calendar, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const CALENDAR_FEATURES = [
  {
    title: "Multi-Platform Timetable",
    desc: "Coordinate synchronized launches across YouTube, YouTube Shorts, and TikTok.",
  },
  {
    title: "Drag-and-Drop Rescheduling",
    desc: "Adjust release pipelines effortlessly based on editing pace.",
  },
  {
    title: "Streak Guardian",
    desc: "Visual alerts to ensure you never miss your upload cadence.",
  },
];

export default function CalendarPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Publishing Calendar
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plan upload schedules, track premiere slots, and keep your consistency streak alive.
          </p>
        </div>

        <Button variant="primary" size="sm" disabled>
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Release</span>
        </Button>
      </div>

      {/* Blueprint Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Schedule & Timetable Engine</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CALENDAR_FEATURES.map((item) => (
              <div
                key={item.title}
                className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={Calendar}
        title="Publishing Calendar Initialized"
        badge="Phase 1 Active"
        description="Event models and date scheduling schemas are established for monthly and weekly timeline views."
      />
    </div>
  );
}
