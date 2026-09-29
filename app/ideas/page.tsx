import { Lightbulb, Plus, Search, Filter, Tags } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const STATUSES = [
  "IDEA",
  "PLANNING",
  "SCRIPTING",
  "PRODUCTION",
  "PUBLISHED",
  "ARCHIVED",
];

const CATEGORIES = [
  "MM2",
  "FUNNY",
  "STORY",
  "TREND",
  "SHORT",
  "LONG VIDEO",
  "OTHER",
];

export default function IdeasPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ideas Hub
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Capture, classify, and track Roblox video concepts from inception to scripting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </Button>
          <Button variant="primary" size="sm" disabled>
            <Plus className="w-3.5 h-3.5" />
            <span>New Idea</span>
          </Button>
        </div>
      </div>

      {/* Feature Blueprint Card */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Ideas Architecture Blueprint</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Supported Statuses
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <Badge key={status} variant="outline" size="sm">
                  {status}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Roblox Content Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge key={cat} variant="purple" size="sm">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Placeholder State */}
      <EmptyState
        icon={Lightbulb}
        title="Ideas Module Initialized"
        badge="Phase 1 Active"
        description="The Ideas workspace route and data schema are ready. Interactive idea creation, search, categorization, and status workflows will be implemented in subsequent phases."
      />
    </div>
  );
}
