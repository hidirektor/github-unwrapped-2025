import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser } from "@/lib/github";

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
    const user = await fetchGitHubUser(token);

    return NextResponse.json({ 
      valid: true, 
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}

