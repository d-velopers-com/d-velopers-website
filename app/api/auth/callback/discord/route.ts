import { NextRequest, NextResponse } from "next/server";

import {
  exchangeCodeForToken,
  getDiscordUser,
  getGuildMember,
} from "@/lib/discord-oauth";
import { createSession } from "@/lib/session";
import { upsertUser } from "@/lib/user";

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
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const redirectUri = getRedirectUri(request);
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    const user = await getDiscordUser(tokenData.access_token);

    const guildId = process.env.DISCORD_GUILD_ID;
    let roles: string[] = [];
    let joinedServerAt: string | null = null;
    let isMember = false;

    if (guildId) {
      const memberData = await getGuildMember(tokenData.access_token, guildId);

      roles = memberData.roles;
      joinedServerAt = memberData.joinedAt || null;
      isMember = memberData.isMember;
    }

    await upsertUser({
      discordId: user.id,
      username: user.username,
      discriminator: user.discriminator,
      email: user.email || null,
      avatar: user.avatar,
      roles,
      joinedServerAt,
      isMember,
    });

    await createSession({
      discordId: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      email: user.email || null,
      roles,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }
}
