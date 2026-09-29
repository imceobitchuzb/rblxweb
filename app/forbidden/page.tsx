import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Restricted — ROXIE HUB",
  description: "You do not have permission to access this workspace resource.",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12 relative">
      <div className="max-w-md w-full text-center bg-surface-900/80 border border-surface-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-surface-100 tracking-tight">Access Restricted</h1>
        <p className="mt-2 text-sm text-surface-400">
          You do not have sufficient permissions to view or modify this workspace resource. Contact your workspace administrator or owner to request access.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-200 font-medium text-sm rounded-xl transition-colors border border-surface-700"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
