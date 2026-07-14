import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const errorDescription = req.nextUrl.searchParams.get("error_description");

  if (error || !code) {
    return new NextResponse(
      `
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #121214; color: #e1e1e6; margin: 0; }
            .card { background: #202024; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center; border: 1px solid #ff4444; }
            h1 { color: #ff4444; margin-top: 0; }
            button { background: #ff4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Authentication Failed</h1>
            <p>${errorDescription || error || "No authorization code received."}</p>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      `
      <html>
        <head>
          <title>Configuration Error</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #121214; color: #e1e1e6; margin: 0; }
            .card { background: #202024; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center; border: 1px solid #f1c40f; }
            h1 { color: #f1c40f; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Configuration Error</h1>
            <p>GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from the environment variables.</p>
            <button onclick="window.close()" style="background: #f1c40f; color: black; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">Close Window</button>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed with status: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to obtain access token.");
    }

    // Get user details
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "pulp-noir-storyteller",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userRes.ok) {
      throw new Error(`Failed to fetch GitHub user info: ${userRes.statusText}`);
    }

    const userData = await userRes.json();
    const username = userData.login;
    const avatarUrl = userData.avatar_url;

    // Send success message to opener window and close
    return new NextResponse(
      `
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #121214; color: #e1e1e6; margin: 0; }
            .card { background: #202024; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center; border: 1px solid #4caf50; }
            h1 { color: #4caf50; margin-top: 0; }
            img { width: 80px; height: 80px; border-radius: 50%; margin: 1rem 0; border: 2px solid #4caf50; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Connected Successfully</h1>
            <p>Authenticated as <strong>${username}</strong></p>
            ${avatarUrl ? `<img src="${avatarUrl}" alt="${username}"/>` : ""}
            <p>Syncing window. This popup will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GITHUB_AUTH_SUCCESS',
                token: '${token}',
                username: '${username}',
                avatarUrl: '${avatarUrl || ""}'
              }, '*');
              setTimeout(() => {
                window.close();
              }, 1000);
            } else {
              // Fallback
              document.querySelector('p').innerHTML = "No parent window detected. Redirecting to home...";
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          </script>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    return new NextResponse(
      `
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #121214; color: #e1e1e6; margin: 0; }
            .card { background: #202024; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center; border: 1px solid #ff4444; }
            h1 { color: #ff4444; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>An Error Occurred</h1>
            <p>${err.message || "An unexpected error occurred during authentication."}</p>
            <button onclick="window.close()" style="background: #ff4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">Close Window</button>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
