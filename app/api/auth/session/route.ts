import { NextResponse } from "next/server";

import { getSession, isDiscordTokenExpired, deleteSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Check if Discord token has expired
  if (isDiscordTokenExpired(session.expiresAt)) {
    // Clear the expired session
    await deleteSession();
    return NextResponse.json({ 
      user: null, 
      tokenExpired: true 
    }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: {
        id: session.discordId,
        username: session.username,
        discriminator: session.discriminator,
        avatar: session.avatar,
        email: session.email,
        roles: session.roles,
      },
    },
    { status: 200 },
  );
}
