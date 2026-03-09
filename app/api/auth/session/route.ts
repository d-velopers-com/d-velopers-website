import { NextResponse } from "next/server";

import { resolveSession } from "@/lib/session";

export async function GET() {
  const { session, discordReauthRequired } = await resolveSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
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
      discordReauthRequired,
    },
    { status: 200 },
  );
}
