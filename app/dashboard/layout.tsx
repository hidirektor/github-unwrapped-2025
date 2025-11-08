import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Unwrapped 2025 - Your Year in Code",
  description: "View your GitHub yearly summary with commits, repositories, and leaderboard level",
  openGraph: {
    title: "GitHub Unwrapped 2025",
    description: "Your Year in Code - See your GitHub yearly summary and leaderboard level",
    type: "website",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

