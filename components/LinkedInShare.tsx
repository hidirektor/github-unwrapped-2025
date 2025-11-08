"use client";

import {Button} from "@/components/ui/button";
import {Download, ExternalLink, Linkedin} from "lucide-react";
import {useState} from "react";

interface LinkedInShareProps {
  username: string;
  commits: number;
  level: string;
  levelEmoji?: string;
  stars?: number;
  prs?: number;
  repos?: number;
  blog?: string;
}

export function LinkedInShare({ 
  username, 
  commits, 
  level, 
  levelEmoji = "🥷",
  stars = 0,
  prs = 0,
  repos = 0,
  blog,
}: LinkedInShareProps) {
  const [generating, setGenerating] = useState(false);
  const currentUrl = typeof window !== "undefined" 
    ? window.location.href 
    : "";

  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "";

  const ogImageUrl = `${baseUrl}/api/og-image?username=${encodeURIComponent(username)}&commits=${commits}&level=${encodeURIComponent(level)}&levelEmoji=${encodeURIComponent(levelEmoji)}&stars=${stars}&prs=${prs}&repos=${repos}`;

  const shareText = `🎉 Reflecting on my coding journey in 2025!

I'm excited to share my GitHub Unwrapped stats for this year. It's been an incredible journey of building, learning, and contributing to open source.

📊 My GitHub Highlights:
✨ ${commits.toLocaleString()} commits
⭐ ${stars.toLocaleString()} stars received
🔀 ${prs.toLocaleString()} pull requests
🏆 Achieved: ${level} ${levelEmoji}

Every commit tells a story, and I'm grateful for the opportunities to collaborate, learn, and grow as a developer. Here's to another year of coding with purpose! 💻

Check out your own GitHub Year in Code:
${currentUrl}${blog ? `\n\n🌐 Visit my website: ${blog}` : ''}`;

  const handleShare = () => {
    // Use LinkedIn's feed URL with text parameter to automatically fill the post
    // This will open LinkedIn with the text pre-filled in the compose modal
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive&mini=true&text=${encodeURIComponent(shareText)}`;
    
    // Open LinkedIn in a new window/tab
    window.open(
      linkedInUrl,
      "_blank",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );
  };

  const handleDownloadImage = async () => {
    setGenerating(true);
    try {
      // First, try to fetch the image
      const response = await fetch(ogImageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/png,image/*,*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('Response is not an image');
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Image is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-unwrapped-2025-${username}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTry opening the image URL directly:\n${ogImageUrl}`);
      
      // Fallback: Open image in new tab
      window.open(ogImageUrl, '_blank');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenImage = () => {
    window.open(ogImageUrl, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-2">
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
      <Button
        onClick={handleOpenImage}
        variant="ghost"
        className="glass border-purple-500/30 text-white hover:bg-white/10"
        size="lg"
        title="Open image in new tab"
      >
        <ExternalLink className="mr-2 h-5 w-5" />
        Open Image
      </Button>
    </div>
  );
}

