import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured in the environment variables." },
      { status: 400 }
    );
  }

  // Determine the app origin
  // If APP_URL environment variable is present, prioritize it
  const origin = process.env.APP_URL || req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.json({ url: authUrl });
}
