import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ROXIE HUB | Roblox Creator Content & Analytics OS",
  description:
    "The modern command center for Roblox video creators: manage ideas, scripts, videos, characters, calendar, and analytics.",
  keywords: [
    "Roblox",
    "Content Creator",
    "YouTube Creator",
    "TikTok Creator",
    "Video Management",
    "ROXIE HUB",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface-canvas antialiased selection:bg-violet-500/30 selection:text-white`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
