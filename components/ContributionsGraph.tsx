"use client";

import {motion} from "framer-motion";
import {useState} from "react";

interface ContributionsGraphProps {
  totalContributions: number;
}

// Generate a mock contributions graph (GitHub-style)
// In a real implementation, you'd fetch daily commit data
function generateContributionsData() {
  const days = 365;
  const weeks = Math.ceil(days / 7);
  const data: number[][] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      const dayIndex = week * 7 + day;
      if (dayIndex < days) {
        // Random contribution level (0-4)
        weekData.push(Math.floor(Math.random() * 5));
      }
    }
    if (weekData.length > 0) {
      data.push(weekData);
    }
  }
  
  return data;
}

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ContributionsGraph({ totalContributions }: ContributionsGraphProps) {
  const [selectedYear] = useState(new Date().getFullYear());
  const contributionsData = generateContributionsData();
  
  const getColor = (level: number) => {
    // Retro purple/blue color scheme
    if (level === 0) return "bg-slate-800";
    if (level === 1) return "bg-[#7c3aed]";
    if (level === 2) return "bg-[#a855f7]";
    if (level === 3) return "bg-[#c084fc]";
    return "bg-[#e9d5ff]";
  };

  // Calculate month labels - show at the start of each month
  const monthLabelPositions: { weekIndex: number; label: string }[] = [];
  const weeksPerMonth = contributionsData.length / 12;
  
  for (let i = 0; i < 12; i++) {
    const weekIndex = Math.floor(i * weeksPerMonth);
    if (weekIndex < contributionsData.length) {
      monthLabelPositions.push({
        weekIndex,
        label: monthLabels[i]
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <div className="retro-border bg-black/70">
        <div className="p-6 border-b retro-border">
          <div className="flex items-center justify-between">
            <h3 className="pixel-text text-sm font-bold text-[#a855f7]">
              {totalContributions.toLocaleString()} CONTRIBUTIONS IN THE LAST YEAR
            </h3>
            <select
              className="retro-border bg-black text-[#60a5fa] retro-text text-xs px-2 py-1"
              value={selectedYear}
              disabled
            >
              <option value={selectedYear}>{selectedYear}</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto pb-2">
            {/* Month labels row - positioned above grid */}
            <div className="flex gap-1 mb-1 relative" style={{ height: "16px" }}>
              <div className="w-6"></div> {/* Spacer for day labels column */}
              <div className="flex gap-1 relative">
                {contributionsData.map((week, weekIndex) => {
                  const monthLabel = monthLabelPositions.find(m => m.weekIndex === weekIndex);
                  return (
                    <div key={weekIndex} className="w-3 relative">
                      {monthLabel && (
                        <span 
                          className="retro-text text-xs text-[#60a5fa] absolute left-0"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {monthLabel.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Day labels and Contribution grid */}
            <div className="flex gap-1 items-start">
              {/* Day labels column */}
              <div className="flex flex-col gap-1 pt-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className="retro-text text-xs text-[#60a5fa] h-3 flex items-center justify-center"
                    style={{ width: "24px" }}
                  >
                    {idx % 2 === 0 ? day : ''}
                  </div>
                ))}
              </div>
              
              {/* Contribution grid */}
              <div className="flex gap-1">
                {contributionsData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((level, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 ${getColor(level)} hover:ring-2 hover:ring-[#a855f7]/50 transition-all cursor-pointer`}
                        style={{ imageRendering: "pixelated" }}
                        title={`${level} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend - Retro Style */}
            <div className="flex items-center gap-2 mt-4 retro-text text-xs text-[#60a5fa]">
              <span>LESS</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-slate-800" style={{ imageRendering: "pixelated" }} />
                <div className="w-3 h-3 bg-[#7c3aed]" style={{ imageRendering: "pixelated" }} />
                <div className="w-3 h-3 bg-[#a855f7]" style={{ imageRendering: "pixelated" }} />
                <div className="w-3 h-3 bg-[#c084fc]" style={{ imageRendering: "pixelated" }} />
                <div className="w-3 h-3 bg-[#e9d5ff]" style={{ imageRendering: "pixelated" }} />
              </div>
              <span>MORE</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

