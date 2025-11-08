"use client";

import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

interface LinkedInShareProps {
  username: string;
  commits: number;
  level: string;
}

export function LinkedInShare({ username, commits, level }: LinkedInShareProps) {
  const currentUrl = typeof window !== "undefined" 
    ? window.location.href 
    : "";

  const shareText = `🚀 Just unlocked "${level}" level on GitHub Unwrapped 2025! 

📊 Stats:
• ${commits.toLocaleString()} commits this year
• Level: ${level}

Check out your GitHub Year in Code! 🎉

${currentUrl}`;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;

  const handleShare = () => {
    // Open LinkedIn share dialog
    window.open(
      linkedInUrl,
      "LinkedIn Share",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );
  };

  return (
    <Button
      onClick={handleShare}
      className="bg-[#0077b5] hover:bg-[#005885] text-white"
      size="lg"
    >
      <Linkedin className="mr-2 h-5 w-5" />
      Share on LinkedIn
    </Button>
  );
}

