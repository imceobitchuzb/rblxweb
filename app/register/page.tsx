import React from "react";
import { Metadata } from "next";
import { AuthCard } from "../../components/auth/AuthCard";
import { RegisterForm } from "../../components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — ROXIE HUB",
  description: "Start your Roblox creator workspace with ROXIE HUB.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your creator studio"
      subtitle="Organize ideas, scripts, characters, and release schedules"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
