import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { getGuildMember } from "@/lib/discord-oauth";
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

    const memberData = await getGuildMember(session.accessToken, guildId);

    await upsertUser({
      discordId: session.discordId,
      username: session.username,
      discriminator: session.discriminator,
      email: session.email,
      avatar: session.avatar,
      roles: memberData.roles,
      joinedServerAt: memberData.joinedAt || null,
    });

    return NextResponse.json({
      success: true,
      joinedServerAt: memberData.joinedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sync profile" },
      { status: 500 },
    );
  }
}
