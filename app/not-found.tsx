import Link from "next/link";
import { AlertCircle, ArrowLeft, Gamepad2, LayoutDashboard, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-300">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-surface-panel/90 border border-white/10 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-950/30">
        <Gamepad2 className="w-10 h-10" />
      </div>

      {/* Code & Title */}
      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
          404 • Page Not Found
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Lost in the Roblox Backrooms?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The studio route or creator asset you are looking for has been moved, unlinked, or does not exist.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" size="sm" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>

        <Link href="/ideas">
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>Browse Ideas Hub</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
