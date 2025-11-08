"use client";

import {motion} from "framer-motion";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {useTheme} from "@/contexts/ThemeContext";

interface CommitChartProps {
  data: { month: string; commits: number }[];
}

export function CommitChart({ data }: CommitChartProps) {
  const { theme } = useTheme();
  
  // Theme-specific colors
  const getChartColors = () => {
    switch (theme) {
      case "retro":
        return {
          primary: "#a855f7",
          secondary: "#3b82f6",
          grid: "#7c3aed",
          text: "#60a5fa",
        };
      case "modern":
        return {
          primary: "#60a5fa",
          secondary: "#38bdf8",
          grid: "rgba(59, 130, 246, 0.2)",
          text: "#94a3b8",
        };
      case "dark":
        return {
          primary: "#ffffff",
          secondary: "#b3b3b3",
          grid: "rgba(255, 255, 255, 0.1)",
          text: "#a3a3a3",
        };
      case "light":
        return {
          primary: "#3b82f6",
          secondary: "#60a5fa",
          grid: "rgba(15, 23, 42, 0.1)",
          text: "#6b7280",
        };
      default:
        return {
          primary: "#a855f7",
          secondary: "#3b82f6",
          grid: "#7c3aed",
          text: "#60a5fa",
        };
    }
  };

  const colors = getChartColors();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="retro-border theme-card-bg p-3">
          <p className="retro-text text-xs theme-text-secondary mb-1">{label}</p>
          <p className="pixel-text text-sm theme-text-primary">
            {payload[0].value} COMMITS
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
    >
      <div className="retro-border theme-card-bg p-6">
        <h3 className="pixel-text text-lg font-bold mb-4 theme-text-primary">
          COMMIT TIMELINE (LAST 365 DAYS)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.6} />
                <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid}
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke={colors.text}
              style={{ 
                fontSize: "11px",
                fontFamily: "var(--theme-font-body)",
              }}
              tick={{ fill: colors.text }}
            />
            <YAxis 
              stroke={colors.text}
              style={{ 
                fontSize: "11px",
                fontFamily: "var(--theme-font-body)",
              }}
              tick={{ fill: colors.text }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="commits"
              stroke={colors.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCommits)"
              dot={{ fill: colors.primary, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: colors.secondary }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

