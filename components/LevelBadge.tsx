"use client";

import { motion } from "framer-motion";
import { LeaderboardLevel, getMotivationalMessage } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: LeaderboardLevel;
  commits: number;
  className?: string;
}

export function LevelBadge({ level, commits, className }: LevelBadgeProps) {
  const message = getMotivationalMessage(level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "relative p-8 rounded-2xl glass border-2 overflow-hidden",
        `bg-gradient-to-br ${level.gradient}`,
        className
      )}
    >
      {/* Glowing border effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-50",
          level.glowClass
        )}
      />

      <div className="relative z-10">
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
          className="text-6xl mb-4 text-center"
        >
          {level.emoji}
        </motion.div>

        <h2 className="text-3xl font-bold text-center mb-2">{level.name}</h2>
        <p className="text-center text-muted-foreground mb-4">
          {level.description}
        </p>
        <p className="text-center text-lg font-semibold text-primary">
          {message}
        </p>

        <div className="mt-6 text-center">
          <span className="text-4xl font-bold">{commits.toLocaleString()}</span>
          <span className="text-muted-foreground ml-2">commits</span>
        </div>
      </div>
    </motion.div>
  );
}

