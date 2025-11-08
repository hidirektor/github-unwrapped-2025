"use client";

import {useState} from "react";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AlertCircle, ExternalLink, Key, Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function TokenPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError("Please enter a GitHub personal access token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate token by trying to fetch user info
      const response = await fetch("/api/github/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid token");
      }

      // Store token in sessionStorage and navigate
      sessionStorage.setItem("github_token", token.trim());
      router.push("/dashboard?type=token");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate token");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen retro-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* CRT Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent h-full animate-scanline" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="retro-border bg-black/90">
          <div className="text-center p-6 border-b retro-border">
            <div className="inline-flex items-center justify-center w-16 h-16 retro-border bg-black/50 mb-4 mx-auto">
              <Key className="w-8 h-8 text-[#3b82f6]" />
            </div>
            <h1 className="pixel-text text-2xl font-bold text-[#3b82f6] mb-2">USE GITHUB TOKEN</h1>
            <p className="retro-text text-sm text-[#60a5fa] mt-2">
              ENTER YOUR PERSONAL ACCESS TOKEN FOR FULL ACCESS TO ALL REPOSITORIES
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block retro-text text-sm text-[#c084fc] mb-2">
                  PERSONAL ACCESS TOKEN
                </label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="retro-border bg-black/50 text-[#60a5fa] font-mono retro-text placeholder:text-[#60a5fa]/50 focus:border-[#3b82f6]"
                  disabled={loading}
                />
                <p className="retro-text text-xs text-[#60a5fa] mt-2">
                  DON'T HAVE A TOKEN?{" "}
                  <Link
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:text-[#60a5fa] underline inline-flex items-center gap-1"
                  >
                    CREATE ONE HERE
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 retro-text text-[#ef4444] text-sm retro-border bg-black/50 p-3"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error.toUpperCase()}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full retro-border-blue bg-black text-[#3b82f6] hover:bg-[#2563eb] hover:text-white pixel-text text-xs py-3 px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    VALIDATING...
                  </>
                ) : (
                  "CONTINUE"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full retro-border bg-black/50 text-[#a855f7] hover:bg-[#7c3aed] hover:text-white pixel-text text-xs py-3 px-4"
                onClick={() => router.push("/")}
              >
                BACK TO HOME
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="p-4 retro-border-blue bg-black/50">
                <p className="retro-text text-xs text-[#60a5fa] mb-2">
                  <strong className="text-[#3b82f6]">REQUIRED SCOPES:</strong>
                </p>
                <ul className="retro-text text-xs text-[#60a5fa] list-disc list-inside space-y-1">
                  <li>PUBLIC_REPO (FOR PUBLIC REPOSITORIES)</li>
                  <li>REPO (FOR PRIVATE REPOSITORIES)</li>
                  <li>READ:USER (FOR USER INFORMATION)</li>
                </ul>
              </div>
              <div className="p-4 retro-border-amber bg-black/50">
                <p className="retro-text text-xs text-[#fcd34d]">
                  <strong className="text-[#fbbf24]">SECURITY NOTE:</strong> YOUR TOKEN IS STORED LOCALLY IN YOUR BROWSER SESSION. 
                  IT IS NEVER SENT TO OUR SERVERS EXCEPT FOR GITHUB API CALLS. MAKE SURE TO REVOKE THE TOKEN 
                  IF YOU NO LONGER NEED IT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

