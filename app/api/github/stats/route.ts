import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats, fetchGitHubUser } from "@/lib/github";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await fetchGitHubUser(token);
    const stats = await fetchGitHubStats(token, user.login, 2025);

    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}

