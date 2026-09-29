import { Video, Plus, Youtube, Radio } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const PLATFORMS = [
  { name: "YouTube", tag: "Long-form 16:9 videos" },
  { name: "YouTube Shorts", tag: "Vertical 9:16 content" },
  { name: "TikTok", tag: "Shorts & clips" },
  { name: "Roblox Experience", tag: "In-game trailer / cinematics" },
];

export default function VideosPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Videos Management
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage published and planned videos, metadata, thumbnails, and multi-platform analytics.
          </p>
        </div>

        <Button variant="primary" size="sm" disabled>
          <Plus className="w-3.5 h-3.5" />
          <span>New Video</span>
        </Button>
      </div>

      {/* Blueprint Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Supported Video Distribution Platforms</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.name}
                className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {platform.name}
                  </span>
                  <Youtube className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400">{platform.tag}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={Video}
        title="Videos Module Initialized"
        badge="Phase 1 Active"
        description="Video metadata models, platform configuration, and metrics tracking schemas are prepared for implementation."
      />
    </div>
  );
}
