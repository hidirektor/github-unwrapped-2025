"use client";

import { Button } from "@/components/ui/button";
import { Linkedin, Download } from "lucide-react";
import { useState } from "react";

interface LinkedInShareProps {
  username: string;
  commits: number;
  level: string;
  levelEmoji?: string;
  stars?: number;
  prs?: number;
  repos?: number;
}

export function LinkedInShare({ 
  username, 
  commits, 
  level, 
  levelEmoji = "🥷",
  stars = 0,
  prs = 0,
  repos = 0,
}: LinkedInShareProps) {
  const [generating, setGenerating] = useState(false);
  const currentUrl = typeof window !== "undefined" 
    ? window.location.href 
    : "";

  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "";

  const ogImageUrl = `${baseUrl}/api/og-image?username=${encodeURIComponent(username)}&commits=${commits}&level=${encodeURIComponent(level)}&levelEmoji=${encodeURIComponent(levelEmoji)}&stars=${stars}&prs=${prs}&repos=${repos}`;

  const shareText = `🚀 Just unlocked "${level}" level on GitHub Unwrapped 2025! 

📊 Stats:
• ${commits.toLocaleString()} commits this year
• ${stars.toLocaleString()} stars received
• ${prs.toLocaleString()} pull requests
• Level: ${level} ${levelEmoji}

Check out your GitHub Year in Code! 🎉

${currentUrl}`;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;

  const handleShare = () => {
    // Open LinkedIn share dialog
    // LinkedIn will automatically fetch the OG image from the URL
    window.open(
      linkedInUrl,
      "LinkedIn Share",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );
  };

  const handleDownloadImage = async () => {
    setGenerating(true);
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-unwrapped-2025-${username}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleShare}
        className="bg-[#0077b5] hover:bg-[#005885] text-white"
        size="lg"
      >
        <Linkedin className="mr-2 h-5 w-5" />
        Share on LinkedIn
      </Button>
      <Button
        onClick={handleDownloadImage}
        disabled={generating}
        variant="outline"
        className="glass border-purple-500/50 text-white hover:bg-white/10"
        size="lg"
      >
        <Download className="mr-2 h-5 w-5" />
        {generating ? "Generating..." : "Download Image"}
      </Button>
    </div>
  );
}

