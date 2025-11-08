"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 octocat-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo/Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={mounted ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass border-2 border-purple-500/50 mb-6">
              <Github className="w-12 h-12 text-purple-400" />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            GitHub Unwrapped 2025
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Discover your year in code. See your commits, top repositories, and
            unlock your developer level.
          </p>

          {/* Authentication Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: OAuth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="glass border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-colors"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-3">
                    <Github className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Sign in via GitHub</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Full access with OAuth authentication. View all your private and public repositories.
                  </p>
                </div>
                <Link href="/api/auth/github" className="block">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Sign in with GitHub
                  </Button>
                </Link>
              </motion.div>

              {/* Option 2: Public Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="glass border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-3">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Retrieve Public Data</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Enter a GitHub username to view public repository statistics. No authentication required.
                  </p>
                </div>
                <Link href="/public" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full glass border-blue-500/50 text-white hover:bg-blue-500/10"
                  >
                    View Public Stats
                  </Button>
                </Link>
              </motion.div>

              {/* Option 3: Token */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="glass border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-colors"
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-3">
                    <span className="text-3xl">🔑</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Use GitHub Token</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Enter your personal access token for full access to all your repositories and private data.
                  </p>
                </div>
                <Link href="/token" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full glass border-green-500/50 text-white hover:bg-green-500/10"
                  >
                    Use Token
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Demo Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <Link href="/demo">
              <Button
                size="lg"
                variant="ghost"
                className="glass border-purple-500/30 text-gray-300 hover:bg-white/10"
              >
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "📊 Your Stats",
                description: "Total commits, PRs, issues, and stars",
              },
              {
                title: "🏆 Leaderboard",
                description: "Unlock levels based on your commits",
              },
              {
                title: "📈 Insights",
                description: "Timeline charts and top repositories",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-6 rounded-2xl glass border border-purple-500/20"
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

