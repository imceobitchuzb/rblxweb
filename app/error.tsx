"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log non-sensitive error metadata in client console
    console.error("ROXIE HUB UI Exception caught:", error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in duration-300">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-surface-panel/90 border border-white/10 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-950/30">
        <AlertTriangle className="w-10 h-10 animate-pulse" />
      </div>

      {/* Title & Message */}
      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
          Studio Rendering Exception
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Something went wrong in the workspace
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          An unexpected error occurred while rendering this studio view. Your local script and video data remain safe.
        </p>
      </div>

      {/* Recovery actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="sm" onClick={() => reset()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
