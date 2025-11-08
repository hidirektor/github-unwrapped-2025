"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

// Mock data for demo
const mockUser = {
  login: "demo-user",
  name: "Demo Developer",
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "Passionate developer",
  public_repos: 42,
  followers: 1234,
  following: 567,
};

const mockStats = {
  totalCommits: 8750,
  totalPRs: 2625,
  totalIssues: 1750,
  totalStars: 5432,
  topRepos: [
    {
      id: 1,
      name: "awesome-project",
      full_name: "demo-user/awesome-project",
      description: "An amazing open source project",
      stargazers_count: 1234,
      language: "TypeScript",
      updated_at: "2025-01-15",
      html_url: "https://github.com/demo-user/awesome-project",
    },
    {
      id: 2,
      name: "cool-app",
      full_name: "demo-user/cool-app",
      description: "A cool application built with React",
      stargazers_count: 890,
      language: "JavaScript",
      updated_at: "2025-01-14",
      html_url: "https://github.com/demo-user/cool-app",
    },
    {
      id: 3,
      name: "backend-api",
      full_name: "demo-user/backend-api",
      description: "RESTful API built with Node.js",
      stargazers_count: 567,
      language: "Node.js",
      updated_at: "2025-01-13",
      html_url: "https://github.com/demo-user/backend-api",
    },
    {
      id: 4,
      name: "mobile-app",
      full_name: "demo-user/mobile-app",
      description: "Cross-platform mobile application",
      stargazers_count: 432,
      language: "React Native",
      updated_at: "2025-01-12",
      html_url: "https://github.com/demo-user/mobile-app",
    },
    {
      id: 5,
      name: "data-visualization",
      full_name: "demo-user/data-visualization",
      description: "Beautiful data visualizations",
      stargazers_count: 321,
      language: "Python",
      updated_at: "2025-01-11",
      html_url: "https://github.com/demo-user/data-visualization",
    },
  ],
  languages: {
    TypeScript: 35,
    JavaScript: 25,
    Python: 20,
    "Node.js": 10,
    "React Native": 5,
    Go: 3,
    Rust: 2,
  },
  commitTimeline: [
    { month: "Jan", commits: 650 },
    { month: "Feb", commits: 720 },
    { month: "Mar", commits: 680 },
    { month: "Apr", commits: 750 },
    { month: "May", commits: 820 },
    { month: "Jun", commits: 790 },
    { month: "Jul", commits: 850 },
    { month: "Aug", commits: 880 },
    { month: "Sep", commits: 920 },
    { month: "Oct", commits: 890 },
    { month: "Nov", commits: 860 },
    { month: "Dec", commits: 940 },
  ],
};

export default function DemoPage() {
  const level = getLevelFromCommits(mockStats.totalCommits);

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
                <AvatarImage src={mockUser.avatar_url} alt={mockUser.login} />
                <AvatarFallback>{mockUser.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{mockUser.name}</h1>
                <p className="text-muted-foreground">@{mockUser.login}</p>
                <p className="text-sm text-muted-foreground mt-1">Demo Mode</p>
              </div>
            </div>
            <LinkedInShare
              username={mockUser.login}
              commits={mockStats.totalCommits}
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
          <LevelBadge level={level} commits={mockStats.totalCommits} />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Commits"
            value={mockStats.totalCommits.toLocaleString()}
            icon={GitCommit}
            delay={0.2}
          />
          <StatsCard
            title="Pull Requests"
            value={mockStats.totalPRs.toLocaleString()}
            icon={GitPullRequest}
            delay={0.3}
          />
          <StatsCard
            title="Issues"
            value={mockStats.totalIssues.toLocaleString()}
            icon={AlertCircle}
            delay={0.4}
          />
          <StatsCard
            title="Stars Received"
            value={mockStats.totalStars.toLocaleString()}
            icon={Star}
            delay={0.5}
          />
        </div>

        {/* Charts and Repos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CommitChart data={mockStats.commitTimeline} />
          <LanguageChart languages={mockStats.languages} />
        </div>

        {/* Top Repos */}
        <TopRepos repos={mockStats.topRepos} />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            This is a demo with mock data. Sign in with GitHub to see your real stats!
          </p>
          <motion.a
            href="/"
            className="inline-block text-purple-400 hover:text-purple-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Home
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}

