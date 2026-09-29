import React from "react";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              R
            </span>
            <span className="text-xl font-black tracking-tight text-surface-50 font-display">
              ROXIE<span className="text-brand-400">HUB</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-surface-50 tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-surface-400">{subtitle}</p>
        </div>

        {/* Form Container */}
        <div className="bg-surface-900/90 border border-surface-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          {children}

          <div className="mt-6 pt-5 border-t border-surface-800/80 text-center text-xs text-surface-400">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>

        {/* Security / System Footer Note */}
        <p className="mt-6 text-center text-xs text-surface-500">
          Secured with isolated workspace encryption &amp; role-based access.
        </p>
      </div>
    </div>
  );
};
