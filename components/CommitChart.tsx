"use client";

import {motion} from "framer-motion";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";

interface CommitChartProps {
  data: { month: string; commits: number }[];
}

export function CommitChart({ data }: CommitChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="retro-border bg-black/90 p-3">
          <p className="retro-text text-xs text-[#60a5fa] mb-1">{label}</p>
          <p className="pixel-text text-sm text-[#a855f7]">
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
      <div className="retro-border bg-black/70 p-6">
        <h3 className="pixel-text text-lg font-bold mb-4 text-[#a855f7]">
          COMMIT TIMELINE (LAST 365 DAYS)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#7c3aed" 
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke="#60a5fa"
              style={{ 
                fontSize: "11px",
                fontFamily: "'VT323', monospace",
              }}
              tick={{ fill: "#60a5fa" }}
            />
            <YAxis 
              stroke="#60a5fa" 
              style={{ 
                fontSize: "11px",
                fontFamily: "'VT323', monospace",
              }}
              tick={{ fill: "#60a5fa" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCommits)"
              dot={{ fill: "#a855f7", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

