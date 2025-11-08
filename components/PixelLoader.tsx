"use client";

import {motion} from "framer-motion";
import {useEffect, useState} from "react";

interface PixelLoaderProps {
  message?: string;
}

export function PixelLoader({ message = "LOADING DATA..." }: PixelLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [terminalMessages, setTerminalMessages] = useState<string[]>([
    "> Connecting to GitHub API...",
    "> Fetching user data...",
    "> Analyzing repositories...",
    "> Calculating statistics...",
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Simulate progress with smoother animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Slow down near the end
        const increment = prev < 30 ? Math.random() * 8 + 3 : 
                         prev < 70 ? Math.random() * 5 + 2 : 
                         Math.random() * 3 + 1;
        return Math.min(prev + increment, 95);
      });
    }, 150);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    // Cycle through terminal messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % terminalMessages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, [terminalMessages.length]);

  return (
    <div className="min-h-screen retro-bg flex items-center justify-center relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent h-full animate-scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        {/* CRT Vignette */}
        <div className="absolute inset-0 box-border border-[20px] border-black/50" />
      </div>

      {/* Retro Pixel Grid Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
          imageRendering: 'pixelated'
        }}
      />

      <div className="relative z-10 text-center">
        {/* Retro Terminal Border Box */}
        <div className="relative inline-block retro-border bg-black/90 p-8">
          {/* Corner Decorations - Retro Style */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#a855f7]" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3b82f6]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#3b82f6]" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#a855f7]" />

          {/* Loading Text - Retro Purple/Blue */}
          <motion.div
            className="pixel-text text-3xl md:text-4xl font-bold text-[#a855f7] mb-6 tracking-wider"
            animate={{
              color: ["#a855f7", "#3b82f6", "#a855f7"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {message}
            <span className="text-[#60a5fa]">{dots}</span>
          </motion.div>

          {/* Retro Progress Bar Container */}
          <div className="relative w-64 md:w-80 h-10 retro-border bg-black mb-4 mx-auto">
            {/* Inner Border - Double */}
            <div className="absolute inset-1 border border-[#7c3aed]/30" />
            
            {/* Progress Bar - Retro Purple/Blue Gradient */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#a855f7]"
              style={{
                width: `${Math.min(progress, 100)}%`,
                boxShadow: "inset 0 0 8px rgba(168, 85, 247, 0.4), 0 0 10px rgba(168, 85, 247, 0.5)",
                imageRendering: "pixelated",
              }}
              animate={{
                boxShadow: [
                  "inset 0 0 8px rgba(168, 85, 247, 0.4), 0 0 10px rgba(168, 85, 247, 0.5)",
                  "inset 0 0 10px rgba(59, 130, 246, 0.5), 0 0 12px rgba(59, 130, 246, 0.6)",
                  "inset 0 0 8px rgba(168, 85, 247, 0.4), 0 0 10px rgba(168, 85, 247, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Retro Pixel Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(168, 85, 247, 0.15) 2px,
                      rgba(168, 85, 247, 0.15) 4px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 3px,
                      rgba(0, 0, 0, 0.2) 3px,
                      rgba(0, 0, 0, 0.2) 6px
                    )
                  `,
                  imageRendering: "pixelated",
                }}
              />
              
              {/* Retro Shine effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
            </motion.div>

            {/* Progress Text - Left aligned - Retro Purple */}
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none pl-3">
              <span 
                className="pixel-text text-[10px] md:text-xs font-bold text-[#c084fc] z-10"
                style={{ textShadow: "0 0 4px rgba(168, 85, 247, 0.8), 2px 2px 0px #000" }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Progress Bar Edge Highlight - Retro */}
            <div 
              className="absolute top-0 left-0 h-full w-2 bg-[#60a5fa]/70"
              style={{ left: `${Math.min(progress, 100)}%`, transform: 'translateX(-100%)', boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }}
            />
          </div>

          {/* Animated Retro Pixel Blocks */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 border-2"
                style={{ 
                  imageRendering: "pixelated",
                  borderColor: i % 2 === 0 ? "#a855f7" : "#3b82f6",
                  backgroundColor: i % 2 === 0 ? "#7c3aed" : "#2563eb",
                  boxShadow: `0 0 6px ${i % 2 === 0 ? "rgba(168, 85, 247, 0.6)" : "rgba(59, 130, 246, 0.6)"}, inset 0 0 3px rgba(255, 255, 255, 0.2)`
                }}
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              >
                {/* Inner pixel highlight */}
                <div className="w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>
            ))}
          </div>

          {/* Retro Terminal Style Text */}
          <div className="mt-4 min-h-[20px]">
            <motion.div
              key={currentMessageIndex}
              className="retro-text text-[#60a5fa] font-mono"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {terminalMessages[currentMessageIndex]}
              <span className="animate-blink text-[#60a5fa]">_</span>
            </motion.div>
          </div>
        </div>

        {/* Glitch Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: [0, -2, 2, -1, 1, 0],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

