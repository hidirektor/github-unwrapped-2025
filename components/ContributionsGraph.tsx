"use client";

import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
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

function getMonthLabel(weekIndex: number, totalWeeks: number) {
  // Approximate month labels based on week position
  const monthsPerWeek = 12 / totalWeeks;
  const monthIndex = Math.floor(weekIndex * monthsPerWeek);
  return monthLabels[monthIndex % 12];
}

export function ContributionsGraph({ totalContributions }: ContributionsGraphProps) {
  const [selectedYear] = useState(new Date().getFullYear());
  const contributionsData = generateContributionsData();
  
  const getColor = (level: number) => {
    if (level === 0) return "bg-slate-800";
    if (level === 1) return "bg-green-900";
    if (level === 2) return "bg-green-700";
    if (level === 3) return "bg-green-500";
    return "bg-green-400";
  };

  // Show month labels every ~4 weeks
  const monthLabelPositions: number[] = [];
  for (let i = 0; i < contributionsData.length; i += 4) {
    monthLabelPositions.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {totalContributions.toLocaleString()} contributions in the last year
            </CardTitle>
            <select
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
              value={selectedYear}
              disabled
            >
              <option value={selectedYear}>{selectedYear}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 items-start">
              {/* Month labels */}
              <div className="flex flex-col gap-1 pt-6">
                {monthLabelPositions.map((pos) => (
                  <div
                    key={pos}
                    className="text-xs text-muted-foreground h-3 flex items-center"
                    style={{ width: "20px" }}
                  >
                    {getMonthLabel(pos, contributionsData.length)}
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
                        className={`w-3 h-3 rounded-sm ${getColor(level)} hover:ring-2 hover:ring-white/50 transition-all cursor-pointer`}
                        title={`${level} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-800" />
                <div className="w-3 h-3 rounded-sm bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

