"use client";

import {useState} from "react";
import {useTheme} from "@/contexts/ThemeContext";
import {AnimatePresence, motion} from "framer-motion";
import {Palette, X} from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: "retro" as const, name: "Retro", color: "#a855f7", description: "Pixelated terminal style" },
    { id: "modern" as const, name: "Modern", color: "#3b82f6", description: "Clean and sleek design" },
    { id: "dark" as const, name: "Dark", color: "#1f2937", description: "Dark mode theme" },
    { id: "light" as const, name: "Light", color: "#f3f4f6", description: "Light mode theme" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 p-4 rounded-lg border-2 bg-black/90 backdrop-blur-sm"
            style={{
              borderColor: themes.find(t => t.id === theme)?.color || "#a855f7",
              boxShadow: `0 0 20px ${themes.find(t => t.id === theme)?.color || "#a855f7"}40`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">SELECT THEME</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded border-2 transition-all text-left ${
                    theme === t.id
                      ? "border-opacity-100 scale-105"
                      : "border-opacity-50 hover:border-opacity-75"
                  }`}
                  style={{
                    borderColor: t.color,
                    backgroundColor: theme === t.id ? `${t.color}20` : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-semibold text-white">{t.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{t.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
        style={{
          borderColor: themes.find(t => t.id === theme)?.color || "#a855f7",
          backgroundColor: `${themes.find(t => t.id === theme)?.color || "#a855f7"}20`,
          boxShadow: `0 0 20px ${themes.find(t => t.id === theme)?.color || "#a855f7"}40`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="h-6 w-6" style={{ color: themes.find(t => t.id === theme)?.color || "#a855f7" }} />
      </motion.button>
    </div>
  );
}

