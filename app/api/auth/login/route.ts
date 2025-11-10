import { NextRequest, NextResponse } from "next/server";

function getRedirectUri(request: NextRequest): string {
  // Usar la variable de entorno si está definida (para desarrollo)
  const envRedirectUri = process.env.DISCORD_REDIRECT_URI;

  // Si estamos en producción o la variable no está definida, construir desde la request
  if (!envRedirectUri || process.env.NODE_ENV === "production") {
    const url = new URL(request.url);
    const protocol = url.protocol;
    const host = url.host;

    return `${protocol}//${host}/api/auth/callback/discord`;
  }

  return envRedirectUri;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = getRedirectUri(request);

  console.log("[AUTH LOGIN] Starting login process");
  console.log("[AUTH LOGIN] Request URL:", request.url);
  console.log("[AUTH LOGIN] Client ID:", clientId ? "✓ Set" : "✗ Missing");
  console.log("[AUTH LOGIN] Redirect URI:", redirectUri);
  console.log("[AUTH LOGIN] NODE_ENV:", process.env.NODE_ENV);

  if (!clientId) {
    console.error("[AUTH LOGIN] ERROR: Missing Discord CLIENT_ID");
    return NextResponse.json(
      { error: "Missing Discord configuration" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email guilds.members.read",
  });

  const discordAuthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
  console.log("[AUTH LOGIN] Redirecting to Discord:", discordAuthUrl);

  return NextResponse.redirect(discordAuthUrl);
}
