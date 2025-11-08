import { NextResponse } from "next/server";

import { getUserByHandler } from "@/lib/user";

interface Params {
  params: Promise<{ handler: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { handler } = await params;
  const user = await getUserByHandler(handler);

  if (!user || !user.isPublic) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    discriminator: user.discriminator,
    handler: user.handler,
    avatar: user.avatar,
    discordId: user.discordId,
    description: user.description,
    link: user.link,
    contactEmail: user.contactEmail,
    country: user.country,
    name: user.name,
    title: user.title,
    tags: user.tags,
    joinedServerAt: user.joinedServerAt,
    profileActivatedAt: user.profileActivatedAt,
  });
}
