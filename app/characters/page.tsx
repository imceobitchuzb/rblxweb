import { Users, Plus, Shield, UserCheck, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const CHARACTER_ROLES = [
  { role: "MAIN", desc: "Primary protagonist or channel persona" },
  { role: "SUPPORTING", desc: "Co-stars, sidekicks, regular cast" },
  { role: "VILLAIN", desc: "Antagonists in MM2 or story roleplay" },
  { role: "NPC", desc: "Background characters and quest givers" },
  { role: "SPECIAL GUEST", desc: "Collaborators and community members" },
];

export default function CharactersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Character Roster
            </h2>
            <Badge variant="purple" size="sm">
              Module Scaffold
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain your universe of Roblox avatars, character personalities, and recurring cast members.
          </p>
        </div>

        <Button variant="primary" size="sm" disabled>
          <Plus className="w-3.5 h-3.5" />
          <span>New Character</span>
        </Button>
      </div>

      {/* Blueprint Info */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Character Roles & Archetypes</CardTitle>
          <Badge variant="neon" size="sm">
            Phase 1
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CHARACTER_ROLES.map((r) => (
              <div
                key={r.role}
                className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm">
                    {r.role}
                  </Badge>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <EmptyState
        icon={Users}
        title="Character Library Initialized"
        badge="Phase 1 Active"
        description="The character roster schema supports avatar rendering, role classification, personality tags, and script cross-referencing."
      />
    </div>
  );
}
