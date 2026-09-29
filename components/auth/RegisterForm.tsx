"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "../../app/actions/auth";

export const RegisterForm: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerAction({
        name,
        email,
        password,
        workspaceName: workspaceName || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during registration.");
      setLoading(false);
    }
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
        <label className="block text-xs font-semibold text-surface-300 mb-1.5" htmlFor="reg-name">
          Creator Name
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Velocity"
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-surface-300 mb-1.5" htmlFor="reg-email">
          Email Address
        </label>
        <input
          id="reg-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@bloxmedia.gg"
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-surface-300 mb-1.5" htmlFor="reg-password">
          Password <span className="text-surface-500 font-normal">(min. 8 characters)</span>
        </label>
        <input
          id="reg-password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-surface-300 mb-1.5" htmlFor="reg-workspace">
          Workspace Name <span className="text-surface-500 font-normal">(Optional)</span>
        </label>
        <input
          id="reg-workspace"
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder={name ? `${name}'s Studio` : "My Roblox Studio"}
          className="w-full px-3.5 py-2.5 bg-surface-950/60 border border-surface-800 rounded-xl text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 hover:to-accent-cyan/90 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
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
            Creating Workspace...
          </>
        ) : (
          "Create Account & Workspace"
        )}
      </button>
    </form>
  );
};
