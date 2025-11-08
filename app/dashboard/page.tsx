"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GitHubUser, GitHubStats } from "@/lib/github";
import { getLevelFromCommits } from "@/lib/leaderboard";
import { LevelBadge } from "@/components/LevelBadge";
import { StatsCard } from "@/components/StatsCard";
import { CommitChart } from "@/components/CommitChart";
import { TopRepos } from "@/components/TopRepos";
import { LanguageChart } from "@/components/LanguageChart";
import { LinkedInShare } from "@/components/LinkedInShare";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/github/stats");
      
      if (response.status === 401) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !user || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Failed to load data"}</p>
          <Button onClick={() => router.push("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const level = getLevelFromCommits(stats.totalCommits);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 octocat-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-500/50">
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user.name || user.login}</h1>
                <p className="text-muted-foreground">@{user.login}</p>
              </div>
            </div>
            <LinkedInShare
              username={user.login}
              commits={stats.totalCommits}
              level={level.name}
            />
          </div>
        </motion.div>

        {/* Level Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <LevelBadge level={level} commits={stats.totalCommits} />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Commits"
            value={stats.totalCommits.toLocaleString()}
            icon={GitCommit}
            delay={0.2}
          />
          <StatsCard
            title="Pull Requests"
            value={stats.totalPRs.toLocaleString()}
            icon={GitPullRequest}
            delay={0.3}
          />
          <StatsCard
            title="Issues"
            value={stats.totalIssues.toLocaleString()}
            icon={AlertCircle}
            delay={0.4}
          />
          <StatsCard
            title="Stars Received"
            value={stats.totalStars.toLocaleString()}
            icon={Star}
            delay={0.5}
          />
        </div>

        {/* Charts and Repos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CommitChart data={stats.commitTimeline} />
          <LanguageChart languages={stats.languages} />
        </div>

        {/* Top Repos */}
        <TopRepos repos={stats.topRepos} />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-muted-foreground"
        >
          <p>Your GitHub Year in Code • 2025</p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

