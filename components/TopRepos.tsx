"use client";

import {useMemo, useState} from "react";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {GitHubRepo} from "@/lib/github";
import {ExternalLink, GitCommit, GitFork, GitPullRequest, Pin, Star} from "lucide-react";
import Link from "next/link";
import {cn} from "@/lib/utils";

interface TopReposProps {
  repos: GitHubRepo[];
}

type SortType = "commits" | "stars" | "forks" | "prs" | "pinned";

export function TopRepos({ repos }: TopReposProps) {
  const [sortBy, setSortBy] = useState<SortType>("commits");

  const sortedRepos = useMemo(() => {
    if (!repos || repos.length === 0) return [];
    
    const reposCopy = [...repos];
    
    let sorted: GitHubRepo[];
    
    switch (sortBy) {
      case "stars":
        sorted = reposCopy.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
        break;
      case "forks":
        sorted = reposCopy.sort((a, b) => (b.forks_count || 0) - (a.forks_count || 0));
        break;
      case "prs":
        sorted = reposCopy.sort((a, b) => (b.prs_count || 0) - (a.prs_count || 0));
        break;
      case "pinned":
        sorted = reposCopy.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return (b.commits_count || 0) - (a.commits_count || 0);
        });
        break;
      case "commits":
      default:
        sorted = reposCopy.sort((a, b) => (b.commits_count || 0) - (a.commits_count || 0));
        break;
    }
    
    return sorted.slice(0, 5);
  }, [repos, sortBy]);

  const sortButtons = [
    { type: "commits" as SortType, label: "Based on Commit", icon: GitCommit },
    { type: "stars" as SortType, label: "Based on Star", icon: Star },
    { type: "forks" as SortType, label: "Based on Fork", icon: GitFork },
    { type: "prs" as SortType, label: "Based on PR", icon: GitPullRequest },
    { type: "pinned" as SortType, label: "Based on Pinned Repositories", icon: Pin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
    >
      <Card className="glass">
        <CardHeader>
          <CardTitle>Top Repositories</CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {sortButtons.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant={sortBy === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(type)}
                className={cn(
                  "text-xs",
                  sortBy === type
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "glass border-purple-500/30 text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg glass hover:bg-white/10 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {repo.name}
                      </h4>
                      {repo.is_pinned && (
                        <Pin className="h-4 w-4 text-yellow-400" fill="currentColor" />
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {repo.language && (
                        <span className="text-xs text-muted-foreground">
                          {repo.language}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitCommit className="h-3 w-3" />
                        {repo.commits_count?.toLocaleString() || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </div>
                      {repo.forks_count !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <GitFork className="h-3 w-3" />
                          {repo.forks_count}
                        </div>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
