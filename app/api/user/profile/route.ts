import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { updateUserProfile, getUserByDiscordId } from "@/lib/user";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);

    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByDiscordId(session.discordId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    handler: user.handler,
    isPublic: user.isPublic,
    description: user.description,
    link: user.link,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { isPublic, description, link } = body;

  const updateData: {
    isPublic?: boolean;
    description?: string | null;
    link?: string | null;
  } = {};

  if (isPublic !== undefined) {
    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isPublic value" },
        { status: 400 },
      );
    }
    updateData.isPublic = isPublic;
  }

  if (description !== undefined) {
    if (description === null || description === "") {
      updateData.description = null;
    } else if (typeof description === "string") {
      if (description.length > 500) {
        return NextResponse.json(
          { error: "Description must be 500 characters or less" },
          { status: 400 },
        );
      }
      updateData.description = description;
    } else {
      return NextResponse.json(
        { error: "Invalid description value" },
        { status: 400 },
      );
    }
  }

  if (link !== undefined) {
    if (link === null || link === "") {
      updateData.link = null;
    } else if (typeof link === "string") {
      if (!isValidUrl(link)) {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 },
        );
      }
      updateData.link = link;
    } else {
      return NextResponse.json(
        { error: "Invalid link value" },
        { status: 400 },
      );
    }
  }

  const user = await updateUserProfile(session.discordId, updateData);

  return NextResponse.json({
    handler: user.handler,
    isPublic: user.isPublic,
    description: user.description,
    link: user.link,
  });
}
