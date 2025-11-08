"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Key, AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 octocat-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="glass border-green-500/30">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4 mx-auto">
              <Key className="w-8 h-8 text-green-400" />
            </div>
            <CardTitle className="text-2xl">Use GitHub Token</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your personal access token for full access to all repositories
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-2">
                  Personal Access Token
                </label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-background/50 border-green-500/30 font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Don't have a token?{" "}
                  <Link
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline inline-flex items-center gap-1"
                  >
                    Create one here
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Required scopes:</strong>
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>public_repo (for public repositories)</li>
                  <li>repo (for private repositories)</li>
                  <li>read:user (for user information)</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Security Note:</strong> Your token is stored locally in your browser session. 
                  It is never sent to our servers except for GitHub API calls. Make sure to revoke the token 
                  if you no longer need it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

