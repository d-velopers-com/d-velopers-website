import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

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
    },
    { status: 200 },
  );
}
