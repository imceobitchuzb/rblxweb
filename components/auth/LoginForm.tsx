"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "../../app/actions/auth";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (!res.success) {
        setError(res.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("roxie@bloxmedia.gg");
    setPassword("RoxieHub2026!");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-surface-300 mb-1.5" htmlFor="login-email">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="creator@bloxmedia.gg"
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-surface-300" htmlFor="login-password">
            Password
          </label>
        </div>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Signing In...
          </>
        ) : (
          "Sign In to Studio"
        )}
      </button>

      {/* Demo Account Helper */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full py-2 px-3 bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/50 rounded-xl text-xs font-medium text-surface-300 hover:text-surface-100 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>⚡</span>
          <span>Fill Demo Credentials (Roxie Velocity)</span>
        </button>
      </div>
    </form>
  );
};
