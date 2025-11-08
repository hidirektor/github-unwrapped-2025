import {NextRequest, NextResponse} from "next/server";
import {fetchPublicGitHubStats, fetchPublicUser} from "@/lib/github";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const user = await fetchPublicUser(username);
    const stats = await fetchPublicGitHubStats(username);

    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error("Error fetching public GitHub stats:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch GitHub data";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

