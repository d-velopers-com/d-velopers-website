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
    name: user.name,
    title: user.title,
    tags: user.tags,
    joinedServerAt: user.joinedServerAt,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { isPublic, description, link, name, title, tags } = body;

  const updateData: {
    isPublic?: boolean;
    description?: string | null;
    link?: string | null;
    name?: string | null;
    title?: string | null;
    tags?: string[];
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

  if (name !== undefined) {
    if (name === null || name === "") {
      updateData.name = null;
    } else if (typeof name === "string") {
      if (name.length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    } else {
      return NextResponse.json(
        { error: "Invalid name value" },
        { status: 400 },
      );
    }
  }

  if (title !== undefined) {
    if (title === null || title === "") {
      updateData.title = null;
    } else if (typeof title === "string") {
      if (title.length > 100) {
        return NextResponse.json(
          { error: "Title must be 100 characters or less" },
          { status: 400 },
        );
      }
      updateData.title = title.trim();
    } else {
      return NextResponse.json(
        { error: "Invalid title value" },
        { status: 400 },
      );
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 },
      );
    }
    if (tags.length > 15) {
      return NextResponse.json(
        { error: "Maximum 15 tags allowed" },
        { status: 400 },
      );
    }
    // Validar que todos los tags sean strings válidos
    const validTags = tags
      .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length <= 50)
      .slice(0, 15); // Limitar a 15 tags

    updateData.tags = validTags;
  }

  const user = await updateUserProfile(session.discordId, updateData);

  return NextResponse.json({
    handler: user.handler,
    isPublic: user.isPublic,
    description: user.description,
    link: user.link,
    name: user.name,
    title: user.title,
    tags: user.tags,
    joinedServerAt: user.joinedServerAt,
  });
}
