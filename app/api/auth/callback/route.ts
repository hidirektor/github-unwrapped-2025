import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/callback`;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GitHub credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(new URL(`/?error=${tokenData.error}`, request.url));
    }

    const accessToken = tokenData.access_token;

    // Store token in a secure cookie (in production, use httpOnly cookies)
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("github_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}

