"use client";

import {useMemo, useState} from "react";
import {motion} from "framer-motion";
import {GitHubRepo} from "@/lib/github";
import {ExternalLink, Pin} from "lucide-react";
import Link from "next/link";

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
    
    // Stable sort function helper
    const stableSort = (compareFn: (a: GitHubRepo, b: GitHubRepo) => number) => {
      return reposCopy.sort((a, b) => {
        const result = compareFn(a, b);
        // If values are equal, sort by id to maintain stability
        return result !== 0 ? result : a.id - b.id;
      });
    };
    
    switch (sortBy) {
      case "stars":
        sorted = stableSort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
        break;
      case "forks":
        sorted = stableSort((a, b) => (b.forks_count || 0) - (a.forks_count || 0));
        break;
      case "prs":
        sorted = stableSort((a, b) => (b.prs_count || 0) - (a.prs_count || 0));
        break;
      case "pinned":
        sorted = stableSort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          // If both pinned or both not pinned, sort by commits
          return (b.commits_count || 0) - (a.commits_count || 0);
        });
        break;
      case "commits":
      default:
        sorted = stableSort((a, b) => (b.commits_count || 0) - (a.commits_count || 0));
        break;
    }
    
    return sorted.slice(0, 5);
  }, [repos, sortBy]);

  const sortButtons = [
    { type: "commits" as SortType, label: "BASED ON COMMIT" },
    { type: "stars" as SortType, label: "BASED ON STAR" },
    { type: "forks" as SortType, label: "BASED ON FORK" },
    { type: "prs" as SortType, label: "BASED ON PR" },
    { type: "pinned" as SortType, label: "BASED ON PINNED REPOSITORIES" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
    >
      <div className="retro-border bg-black/70 p-6">
        <h3 className="pixel-text text-lg font-bold mb-4 text-[#a855f7]">
          TOP REPOSITORIES
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {sortButtons.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={`px-3 py-2 text-xs pixel-text transition-all ${
                sortBy === type
                  ? "retro-border-blue bg-black/70 text-[#60a5fa] border-[#3b82f6]"
                  : "retro-border bg-black/30 text-[#c084fc] hover:border-[#a855f7] hover:bg-black/50 hover:text-[#a855f7]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {sortedRepos.length === 0 ? (
            <div className="retro-text text-center text-[#60a5fa] py-8">
              NO REPOSITORIES FOUND
            </div>
          ) : (
            sortedRepos.map((repo, index) => (
              <motion.div
                key={`${repo.id}-${sortBy}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 retro-border bg-black/40 hover:bg-black/60 hover:border-[#a855f7] transition-all group"
                >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="pixel-text text-sm font-bold text-[#a855f7] group-hover:text-[#c084fc] transition-colors">
                      {repo.name.toUpperCase()}
                    </h4>
                    {repo.is_pinned && (
                      <Pin className="h-4 w-4 text-[#fbbf24]" fill="#fbbf24" />
                    )}
                  </div>
                  {repo.description && (
                    <p className="retro-text text-xs text-[#60a5fa] mb-3 line-clamp-1">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    {repo.language && (
                      <span className="retro-text text-xs text-[#c084fc] retro-border px-2 py-1 bg-black/30">
                        {repo.language}
                      </span>
                    )}
                    <span className="retro-text text-xs text-[#60a5fa]">
                      COMMITS: <span className="pixel-text text-[#a855f7]">{repo.commits_count?.toLocaleString() || 0}</span>
                    </span>
                    <span className="retro-text text-xs text-[#60a5fa]">
                      STARS: <span className="pixel-text text-[#a855f7]">{repo.stargazers_count || 0}</span>
                    </span>
                    {repo.forks_count !== undefined && (
                      <span className="retro-text text-xs text-[#60a5fa]">
                        FORKS: <span className="pixel-text text-[#a855f7]">{repo.forks_count}</span>
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-[#60a5fa] group-hover:text-[#a855f7] transition-colors ml-4 flex-shrink-0" />
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
