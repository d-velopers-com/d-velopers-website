import { NextResponse } from "next/server";

import { getSession, createSession } from "@/lib/session";
import { getDiscordUser, getGuildMember } from "@/lib/discord-oauth";
import { upsertUser } from "@/lib/user";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!guildId) {
      return NextResponse.json(
        { error: "Guild ID not configured" },
        { status: 500 },
      );
    }

    // Obtener datos actualizados de Discord
    const discordUser = await getDiscordUser(session.accessToken);
    const memberData = await getGuildMember(session.accessToken, guildId);

    // Actualizar la base de datos con los datos más recientes
    await upsertUser({
      discordId: session.discordId,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      email: discordUser.email || null,
      avatar: discordUser.avatar,
      roles: memberData.roles,
      joinedServerAt: memberData.joinedAt || null,
    });

    // Actualizar la sesión con los datos actualizados de Discord
    await createSession({
      discordId: session.discordId,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email || null,
      roles: memberData.roles,
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    });

    return NextResponse.json({
      success: true,
      joinedServerAt: memberData.joinedAt,
    });
  } catch (error) {
    console.error("Sync error details:", error);
    
    // Detect if it's a token expiration error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("Failed to fetch Discord")) {
      return NextResponse.json(
        { error: "Discord token expired. Please log out and log in again." },
        { status: 401 },
      );
    }
    
    return NextResponse.json(
      { error: "Failed to sync profile" },
      { status: 500 },
    );
  }
}
