import { FileText, Plus, Film, Clock, MessageSquare, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const SCRIPT_COMPONENTS = [
  {
    icon: Film,
    title: "Dynamic Scene Builder",
    description: "Add, reorder, and estimate timing per scene for tight pacing.",
  },
  {
    icon: MessageSquare,
    title: "Dialogue & Sound Cues",
    description: "Assign lines to Roblox avatars and time audio soundboard cues.",
  },
  {
    icon: Users,
    title: "Character Cast Integration",
    description: "Tag characters directly from your Roblox avatar roster.",
  },
  {
    icon: Clock,
    title: "Smart Duration Calculation",
    description: "Live calculation of total script runtime based on dialogue & scenes.",
  },
];

export default function ScriptsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Script Studio
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured scene-by-scene script editor designed for Roblox storytelling and skits.
          </p>
        </div>

        <Button variant="primary" size="sm" disabled>
          <Plus className="w-3.5 h-3.5" />
          <span>New Script</span>
        </Button>
      </div>

      {/* Blueprint Feature Cards */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Script Editor Capabilities</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCRIPT_COMPONENTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={FileText}
        title="Script Studio Initialized"
        badge="Phase 1 Active"
        description="The scene-by-scene script editor schema and data structures are defined and ready for UI implementation."
      />
    </div>
  );
}
