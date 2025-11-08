"use client";

import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Github} from "lucide-react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {ThemeSelector} from "@/components/ThemeSelector";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen retro-bg relative overflow-hidden theme-bg">
      {/* CRT Scanline Effect - Only for Retro Theme */}
      <div className="absolute inset-0 pointer-events-none scanline-effect">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent h-full animate-scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
      
      {/* Theme-aware Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 border-4 theme-border opacity-10"
          style={{ borderColor: 'var(--theme-text-primary)' }}
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
          className="absolute bottom-20 right-20 w-96 h-96 border-4 theme-border opacity-10"
          style={{ borderColor: 'var(--theme-text-secondary)' }}
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
          {/* Logo/Header - Retro Style */}
          <motion.div
            initial={{ scale: 0 }}
            animate={mounted ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 retro-border theme-card-bg mb-6">
              <Github className="w-12 h-12 theme-text-primary" />
            </div>
          </motion.div>

          <h1 className="pixel-text text-4xl md:text-6xl font-bold mb-6 theme-text-primary">
            GITHUB UNWRAPPED 2025
          </h1>

          <p className="retro-text text-xl md:text-2xl theme-text-secondary mb-12 max-w-2xl mx-auto">
            DISCOVER YOUR YEAR IN CODE. SEE YOUR COMMITS, TOP REPOSITORIES, AND
            UNLOCK YOUR DEVELOPER LEVEL.
          </p>

          {/* Authentication Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: OAuth - Retro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="retro-border theme-card-bg p-6 theme-hover transition-all flex flex-col h-full"
              >
                <div className="text-center mb-4 flex-grow">
                  <div className="inline-flex items-center justify-center w-16 h-16 retro-border theme-card-bg mb-3">
                    <Github className="w-8 h-8 theme-text-primary" />
                  </div>
                  <h3 className="pixel-text text-sm font-bold mb-2 theme-text-primary">SIGN IN VIA GITHUB</h3>
                  <p className="retro-text text-xs theme-text-secondary mb-4">
                    FULL ACCESS WITH OAUTH AUTHENTICATION. VIEW ALL YOUR PRIVATE AND PUBLIC REPOSITORIES.
                  </p>
                </div>
                <Link href="/api/auth/github" className="block mt-auto">
                  <Button
                    size="lg"
                    className="w-full retro-border theme-card-bg theme-text-primary hover:opacity-80 pixel-text text-[10px] whitespace-normal py-3 px-4"
                  >
                    SIGN IN WITH GITHUB
                  </Button>
                </Link>
              </motion.div>

              {/* Option 2: Public Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="retro-border theme-card-bg p-6 theme-hover transition-all flex flex-col h-full"
              >
                <div className="text-center mb-4 flex-grow">
                  <div className="inline-flex items-center justify-center w-16 h-16 retro-border theme-card-bg mb-3">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="pixel-text text-sm font-bold mb-2 theme-text-accent">RETRIEVE PUBLIC DATA</h3>
                  <p className="retro-text text-xs theme-text-secondary mb-4">
                    ENTER A GITHUB USERNAME TO VIEW PUBLIC REPOSITORY STATISTICS. NO AUTHENTICATION REQUIRED.
                  </p>
                </div>
                <Link href="/public" className="block mt-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full retro-border theme-card-bg theme-text-accent hover:opacity-80 pixel-text text-[10px] whitespace-normal py-3 px-4"
                  >
                    VIEW PUBLIC STATS
                  </Button>
                </Link>
              </motion.div>

              {/* Option 3: Token */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 }}
                className="retro-border theme-card-bg p-6 theme-hover transition-all flex flex-col h-full"
              >
                <div className="text-center mb-4 flex-grow">
                  <div className="inline-flex items-center justify-center w-16 h-16 retro-border theme-card-bg mb-3">
                    <span className="text-3xl">🔑</span>
                  </div>
                  <h3 className="pixel-text text-sm font-bold mb-2 theme-text-primary">USE GITHUB TOKEN</h3>
                  <p className="retro-text text-xs theme-text-secondary mb-4">
                    ENTER YOUR PERSONAL ACCESS TOKEN FOR FULL ACCESS TO ALL YOUR REPOSITORIES AND PRIVATE DATA.
                  </p>
                </div>
                <Link href="/token" className="block mt-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full retro-border theme-card-bg theme-text-primary hover:opacity-80 pixel-text text-[10px] whitespace-normal py-3 px-4"
                  >
                    USE TOKEN
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Demo Option - Retro */}
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
                className="retro-border theme-card-bg theme-text-primary hover:opacity-80 pixel-text text-xs"
              >
                VIEW DEMO
              </Button>
            </Link>
          </motion.div>

          {/* Features - Retro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "YOUR STATS",
                description: "TOTAL COMMITS, PRS, ISSUES, AND STARS",
              },
              {
                title: "LEADERBOARD",
                description: "UNLOCK LEVELS BASED ON YOUR COMMITS",
              },
              {
                title: "INSIGHTS",
                description: "TIMELINE CHARTS AND TOP REPOSITORIES",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-6 retro-border theme-card-bg theme-hover"
              >
                <h3 className="pixel-text text-lg font-bold mb-2 theme-text-primary">{feature.title}</h3>
                <p className="retro-text theme-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <ThemeSelector />
    </div>
  );
}

