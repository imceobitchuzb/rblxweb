import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthCard } from "../../components/auth/AuthCard";
import { LoginForm } from "../../components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — ROXIE HUB",
  description: "Sign in to your Roblox creator studio workspace.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Roblox content production hub"
      footerText="Don't have an account?"
      footerLinkText="Create a workspace"
      footerHref="/register"
    >
      <Suspense fallback={<div className="text-center py-6 text-sm text-surface-400">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
