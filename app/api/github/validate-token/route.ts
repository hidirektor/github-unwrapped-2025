import {NextRequest, NextResponse} from "next/server";
import {fetchGitHubUser} from "@/lib/github";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate token by fetching user info
    try {
      const user = await fetchGitHubUser(token);

      // Check if we can access user emails (required for accurate commit counting)
      let hasEmailAccess = false;
      try {
        const emailsResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        hasEmailAccess = emailsResponse.ok;
      } catch (e) {
        // Email access check failed
      }

      // Check if we can access repos (required for stats)
      let hasRepoAccess = false;
      try {
        const reposResponse = await fetch("https://api.github.com/user/repos?per_page=1", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        hasRepoAccess = reposResponse.ok;
      } catch (e) {
        // Repo access check failed
      }

      return NextResponse.json({ 
        valid: true, 
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
        },
        permissions: {
          hasEmailAccess,
          hasRepoAccess,
        }
      });
    } catch (userError: any) {
      // More detailed error handling
      if (userError.message?.includes("401") || userError.message?.includes("Bad credentials")) {
        return NextResponse.json(
          { error: "Invalid token. Please check your token and try again." },
          { status: 401 }
        );
      }
      if (userError.message?.includes("403") || userError.message?.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 403 }
        );
      }
      throw userError;
    }
  } catch (error: any) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Invalid token. Please check that your token has the required permissions: repo, read:user, user:email",
        details: error.message
      },
      { status: 401 }
    );
  }
}

