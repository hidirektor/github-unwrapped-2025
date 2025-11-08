export interface LeaderboardLevel {
  name: string;
  emoji: string;
  badgeColor: string;
  description: string;
  gradient: string;
  glowClass: string;
  minCommits: number;
  maxCommits: number;
}

export const LEADERBOARD_LEVELS: LeaderboardLevel[] = [
  {
    name: "Code Ninja",
    emoji: "🥷",
    badgeColor: "blue",
    description: "Silent but deadly coder",
    gradient: "from-blue-500/20 to-blue-600/20",
    glowClass: "neon-blue",
    minCommits: 0,
    maxCommits: 1000,
  },
  {
    name: "Code Samurai",
    emoji: "⚔️",
    badgeColor: "purple",
    description: "Master of repositories",
    gradient: "from-purple-500/20 to-purple-600/20",
    glowClass: "neon-purple",
    minCommits: 1001,
    maxCommits: 5000,
  },
  {
    name: "Open Source Master",
    emoji: "🧠",
    badgeColor: "gold",
    description: "Inspires through code",
    gradient: "from-yellow-500/20 to-amber-600/20",
    glowClass: "neon-gold",
    minCommits: 5001,
    maxCommits: 10000,
  },
  {
    name: "Legendary Developer",
    emoji: "🚀",
    badgeColor: "platinum",
    description: "Leaves commits in the stars",
    gradient: "from-gray-300/20 via-white/20 to-gray-400/20",
    glowClass: "neon-platinum",
    minCommits: 10001,
    maxCommits: Infinity,
  },
];

export function getLevelFromCommits(commits: number): LeaderboardLevel {
  return (
    LEADERBOARD_LEVELS.find(
      (level) => commits >= level.minCommits && commits <= level.maxCommits
    ) || LEADERBOARD_LEVELS[0]
  );
}

export function getMotivationalMessage(level: LeaderboardLevel): string {
  const messages: Record<string, string> = {
    "Code Ninja": "Keep slashing bugs, Ninja!",
    "Code Samurai": "Your code cuts through complexity like a blade!",
    "Open Source Master": "You're inspiring the next generation of developers!",
    "Legendary Developer": "Your commits echo through the cosmos!",
  };
  return messages[level.name] || "Keep coding!";
}

