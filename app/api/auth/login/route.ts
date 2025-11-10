import { NextRequest, NextResponse } from "next/server";

function getRedirectUri(request: NextRequest): string {
  // Priorizar la variable de entorno si está definida (recomendado para producción)
  const envRedirectUri = process.env.DISCORD_REDIRECT_URI;

  if (envRedirectUri) {
    return envRedirectUri;
  }

  // Fallback: construir desde la request si no está definida
  const url = new URL(request.url);
  const protocol = url.protocol;
  const host = url.host;

  return `${protocol}//${host}/api/auth/callback/discord`;
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
