"use client";

import {Suspense, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {motion} from "framer-motion";
import {GitHubStats, GitHubUser} from "@/lib/github";
import {getLevelFromCommits} from "@/lib/leaderboard";
import {LevelBadge} from "@/components/LevelBadge";
import {StatsCard} from "@/components/StatsCard";
import {CommitChart} from "@/components/CommitChart";
import {TopRepos} from "@/components/TopRepos";
import {LanguageChart} from "@/components/LanguageChart";
import {ContributionsGraph} from "@/components/ContributionsGraph";
import {LinkedInShare} from "@/components/LinkedInShare";
import {PixelLoader} from "@/components/PixelLoader";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {AlertCircle, Building2, GitCommit, GitPullRequest, Link as LinkIcon, MapPin, Star, Users,} from "lucide-react";
import {Button} from "@/components/ui/button";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataType, setDataType] = useState<"oauth" | "public" | "token">("oauth");

  useEffect(() => {
    const type = searchParams.get("type");
    const username = searchParams.get("username");
    
    if (type === "public" && username) {
      setDataType("public");
      fetchPublicStats(username);
    } else if (type === "token") {
      setDataType("token");
      fetchTokenStats();
    } else {
      setDataType("oauth");
      fetchOAuthStats();
    }
  }, [searchParams]);

  const fetchOAuthStats = async () => {
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

  const fetchPublicStats = async (username: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/github/public-stats?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch public stats");
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

  const fetchTokenStats = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("github_token");
      
      if (!token) {
        router.push("/token");
        return;
      }

      const response = await fetch("/api/github/stats?type=token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        sessionStorage.removeItem("github_token");
        router.push("/token");
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
    return <PixelLoader message="LOADING DATA..." />;
  }

  if (error || !user || !stats) {
    return (
      <div className="min-h-screen retro-bg flex items-center justify-center">
        <div className="text-center retro-border bg-black/90 p-8">
          <p className="retro-text text-[#ef4444] mb-4">{error || "FAILED TO LOAD DATA"}</p>
          <Button onClick={() => router.push("/")} className="retro-border bg-black text-[#a855f7] hover:bg-[#7c3aed]">GO BACK</Button>
        </div>
      </div>
    );
  }

  const level = getLevelFromCommits(stats.totalCommits);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen retro-bg text-[#c084fc] relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent h-full animate-scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header - Retro Terminal Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Profile Picture - Retro Border */}
            <div className="flex-shrink-0">
              <div className="retro-border p-2 bg-black/50">
                <Avatar className="h-64 w-64 border-4 border-[#a855f7] rounded-none">
                  <AvatarImage src={user.avatar_url} alt={user.login} />
                  <AvatarFallback className="text-4xl bg-black text-[#c084fc]">
                    {user.login[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Right: User Info - Retro Terminal */}
            <div className="flex-1 retro-border bg-black/70 p-6">
              <div className="mb-4">
                <h1 className="pixel-text text-2xl md:text-3xl font-bold mb-2 text-[#a855f7]">{user.name || user.login}</h1>
                <p className="retro-text text-xl text-[#60a5fa] mb-4">@{user.login}</p>
                {dataType === "public" && (
                  <span className="inline-block px-3 py-1 text-xs retro-border-amber bg-black/50 text-[#fbbf24] mb-2">
                    PUBLIC DATA ONLY
                  </span>
                )}
                {dataType === "token" && (
                  <span className="inline-block px-3 py-1 text-xs retro-border-blue bg-black/50 text-[#60a5fa] mb-2">
                    TOKEN AUTHENTICATED
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="retro-text text-[#60a5fa] mb-4">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm retro-text text-[#c084fc] mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-[#a855f7]" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-[#a855f7]" />
                    <span>{user.company}</span>
                  </div>
                )}
                {user.blog && (
                  <a
                    href={user.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>{user.blog.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-[#a855f7]" />
                  <span>{user.followers} FOLLOWERS</span>
                  <span className="mx-1">·</span>
                  <span>{user.following} FOLLOWING</span>
                </div>
              </div>

              <div className="mt-4">
                <LinkedInShare
                  username={user.login}
                  commits={stats.totalCommits}
                  level={level.name}
                  levelEmoji={level.emoji}
                  stars={stats.totalStars}
                  prs={stats.totalPRs}
                  repos={stats.topRepos.length}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <LevelBadge level={level} commits={stats.totalCommits} />
        </motion.div>

        {/* Contributions Graph - GitHub Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ContributionsGraph totalContributions={stats.totalCommits} />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Commits"
            value={stats.totalCommits.toLocaleString()}
            icon={GitCommit}
            delay={0.3}
          />
          <StatsCard
            title="Pull Requests"
            value={stats.totalPRs.toLocaleString()}
            icon={GitPullRequest}
            delay={0.4}
          />
          <StatsCard
            title="Issues"
            value={stats.totalIssues.toLocaleString()}
            icon={AlertCircle}
            delay={0.5}
          />
          <StatsCard
            title="Stars Received"
            value={stats.totalStars.toLocaleString()}
            icon={Star}
            delay={0.6}
          />
        </div>

        {/* Charts and Repos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CommitChart data={stats.commitTimeline} />
          <LanguageChart languages={stats.languages} />
        </div>

        {/* Top Repos */}
        <TopRepos repos={stats.topRepos} />

        {/* Footer - Retro Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center retro-text text-[#c084fc]"
        >
          <p className="retro-border bg-black/70 p-4 inline-block">YOUR GITHUB YEAR IN CODE • LAST 365 DAYS</p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<PixelLoader message="INITIALIZING..." />}>
      <DashboardContent />
    </Suspense>
  );
}
