"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublicDataPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setError(null);

    // Navigate to dashboard with username and type
    router.push(`/dashboard?username=${encodeURIComponent(username.trim())}&type=public`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 octocat-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="glass border-blue-500/30">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4 mx-auto">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Retrieve Public Data</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter a GitHub username to view their public repository statistics
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  GitHub Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="octocat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-blue-500/30"
                />
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Search className="mr-2 h-4 w-4" />
                View Public Stats
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

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> This method only retrieves public repository data. 
                Private repositories, detailed commit history, and some statistics may not be available.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

