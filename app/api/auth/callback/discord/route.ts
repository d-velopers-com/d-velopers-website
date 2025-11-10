import { NextRequest, NextResponse } from "next/server";

import {
  exchangeCodeForToken,
  getDiscordUser,
  getGuildMember,
} from "@/lib/discord-oauth";
import { createSession } from "@/lib/session";
import { upsertUser } from "@/lib/user";

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
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  console.log("[AUTH CALLBACK] Callback received");
  console.log("[AUTH CALLBACK] Request URL:", request.url);
  console.log("[AUTH CALLBACK] Has code:", code ? "✓ Yes" : "✗ No");
  console.log("[AUTH CALLBACK] Has error:", error || "No");

  if (error) {
    console.error("[AUTH CALLBACK] ERROR from Discord:", error);
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    console.error("[AUTH CALLBACK] ERROR: No authorization code received");
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    console.log("[AUTH CALLBACK] Step 1: Getting redirect URI");
    const redirectUri = getRedirectUri(request);
    console.log("[AUTH CALLBACK] Redirect URI:", redirectUri);

    console.log("[AUTH CALLBACK] Step 2: Exchanging code for token");
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    console.log("[AUTH CALLBACK] ✓ Token exchange successful");

    console.log("[AUTH CALLBACK] Step 3: Getting Discord user");
    const user = await getDiscordUser(tokenData.access_token);
    console.log("[AUTH CALLBACK] ✓ User fetched:", user.username);

    const guildId = process.env.DISCORD_GUILD_ID;
    let roles: string[] = [];
    let joinedServerAt: string | null = null;

    if (guildId) {
      console.log("[AUTH CALLBACK] Step 4: Getting guild member data");
      const memberData = await getGuildMember(tokenData.access_token, guildId);
      console.log("[AUTH CALLBACK] ✓ Guild member data:", {
        isMember: memberData.isMember,
        rolesCount: memberData.roles.length,
      });

      roles = memberData.roles;
      joinedServerAt = memberData.joinedAt || null;
    } else {
      console.log("[AUTH CALLBACK] Step 4: Skipping guild check (no GUILD_ID)");
    }

    console.log("[AUTH CALLBACK] Step 5: Upserting user to database");
    await upsertUser({
      discordId: user.id,
      username: user.username,
      discriminator: user.discriminator,
      email: user.email || null,
      avatar: user.avatar,
      roles,
      joinedServerAt,
    });
    console.log("[AUTH CALLBACK] ✓ User saved to database");

    console.log("[AUTH CALLBACK] Step 6: Creating session");
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
    console.log("[AUTH CALLBACK] ✓ Session created");

    console.log("[AUTH CALLBACK] ✓ SUCCESS: Redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("[AUTH CALLBACK] ✗ ERROR in callback:", error);
    console.error("[AUTH CALLBACK] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }
}
