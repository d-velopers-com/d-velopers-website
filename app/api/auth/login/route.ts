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

  if (!clientId) {
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

  return NextResponse.redirect(discordAuthUrl);
}
