"use client";

import {motion} from "framer-motion";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip,} from "recharts";
import {useTheme} from "@/contexts/ThemeContext";

interface LanguageChartProps {
  languages: Record<string, number>;
}

// Theme-specific color palettes
const getThemeColors = (theme: string) => {
  switch (theme) {
    case "retro":
      return [
        "#a855f7", // Purple
        "#3b82f6", // Blue
        "#7c3aed", // Dark Purple
        "#60a5fa", // Light Blue
        "#c084fc", // Light Purple
        "#2563eb", // Dark Blue
        "#fbbf24", // Amber
        "#06b6d4", // Cyan
      ];
    case "modern":
      return [
        "#60a5fa", // Blue
        "#38bdf8", // Sky Blue
        "#3b82f6", // Blue
        "#8b5cf6", // Purple
        "#a78bfa", // Violet
        "#06b6d4", // Cyan
        "#ec4899", // Pink
        "#f59e0b", // Amber
      ];
    case "dark":
      return [
        "#ffffff", // White
        "#b3b3b3", // Light Gray
        "#808080", // Gray
        "#666666", // Dark Gray
        "#4d4d4d", // Darker Gray
        "#ffffff", // White (repeat)
        "#b3b3b3", // Light Gray (repeat)
        "#808080", // Gray (repeat)
      ];
    case "light":
      return [
        "#3b82f6", // Blue
        "#60a5fa", // Light Blue
        "#8b5cf6", // Purple
        "#06b6d4", // Cyan
        "#10b981", // Green
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#ec4899", // Pink
      ];
    default:
      return [
        "#a855f7", "#3b82f6", "#7c3aed", "#60a5fa",
        "#c084fc", "#2563eb", "#fbbf24", "#06b6d4",
      ];
  }
};

export function LanguageChart({ languages }: LanguageChartProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  
  const data = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const getStrokeColor = () => {
    switch (theme) {
      case "retro":
      case "dark":
        return "#000";
      case "modern":
      case "light":
        return "rgba(255, 255, 255, 0.1)";
      default:
        return "#000";
    }
  };

  const getTextColor = () => {
    switch (theme) {
      case "retro":
        return "#60a5fa";
      case "modern":
        return "#94a3b8";
      case "dark":
        return "#b3b3b3";
      case "light":
        return "#6b7280";
      default:
        return "#60a5fa";
    }
  };

  const textColor = getTextColor();
  const strokeColor = getStrokeColor();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="retro-border theme-card-bg p-3">
          <p className="retro-text text-xs theme-text-secondary mb-1">
            {payload[0].name}
          </p>
          <p className="pixel-text text-sm theme-text-primary">
            {payload[0].value} LINES
          </p>
          <p className="retro-text text-xs theme-text-accent mt-1">
            {((payload[0].payload.percent || 0) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontFamily: "var(--theme-font-body)",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="retro-border theme-card-bg p-6">
        <h3 className="pixel-text text-lg font-bold mb-4 theme-text-primary">
          MOST USED LANGUAGES
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={theme === "retro" || theme === "dark" ? 2 : 1}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke={strokeColor}
                  strokeWidth={theme === "retro" || theme === "dark" ? 2 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
