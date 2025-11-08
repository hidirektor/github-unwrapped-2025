import {NextRequest, NextResponse} from "next/server";
import {fetchGitHubStats, fetchGitHubUser} from "@/lib/github";

export async function GET(request: NextRequest) {
  // Try to get token from cookie (OAuth) first
  let token = request.cookies.get("github_token")?.value;
  
  // If no cookie, try Authorization header (for token-based auth)
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await fetchGitHubUser(token);
    const stats = await fetchGitHubStats(token, user.login);

    // Return user without sensitive email data
    const { emails, ...userWithoutEmails } = user;
    return NextResponse.json({ user: userWithoutEmails, stats });
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}

