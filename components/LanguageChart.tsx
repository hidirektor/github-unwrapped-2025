"use client";

import {motion} from "framer-motion";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip,} from "recharts";

interface LanguageChartProps {
  languages: Record<string, number>;
}

// Retro color palette - purple/blue theme
const COLORS = [
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#7c3aed", // Dark Purple
  "#60a5fa", // Light Blue
  "#c084fc", // Light Purple
  "#2563eb", // Dark Blue
  "#fbbf24", // Amber (accent)
  "#06b6d4", // Cyan
];

export function LanguageChart({ languages }: LanguageChartProps) {
  const data = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="retro-border bg-black/90 p-3">
          <p className="retro-text text-xs text-[#60a5fa] mb-1">
            {payload[0].name}
          </p>
          <p className="pixel-text text-sm text-[#a855f7]">
            {payload[0].value} LINES
          </p>
          <p className="retro-text text-xs text-[#c084fc] mt-1">
            {((payload[0].payload.percent || 0) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    // Only show label if percentage is greater than 5%
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#60a5fa"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontFamily: "'VT323', monospace",
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
      <div className="retro-border bg-black/70 p-6">
        <h3 className="pixel-text text-lg font-bold mb-4 text-[#a855f7]">
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
              stroke="#000"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#000"
                  strokeWidth={2}
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

