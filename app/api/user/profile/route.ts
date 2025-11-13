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

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
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
    contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    contactEmail: user.contactEmail,
    country: user.country,
    name: user.name,
    title: user.title,
    tags: user.tags,
    joinedServerAt: user.joinedServerAt,
    profileActivatedAt: user.profileActivatedAt,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    isPublic,
    description,
    link,
    contactLinks,
    contactEmail,
    country,
    name,
    title,
    tags,
  } = body;

  const updateData: {
    isPublic?: boolean;
    description?: string | null;
    link?: string | null;
    contactLinks?: string[];
    contactEmail?: string | null;
    country?: string | null;
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

    if (isPublic === true) {
      const user = await getUserByDiscordId(session.discordId);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const allowedRolesEnv = process.env.ALLOWED_ROLES || "";
      const allowedRoles = allowedRolesEnv
        .split(",")
        .map((role) => role.trim())
        .filter((role) => role.length > 0);

      const isServerMember = session.roles && session.roles.length > 0;
      const hasAllowedRole =
        isServerMember &&
        allowedRoles.length > 0 &&
        session.roles.some((roleId) => allowedRoles.includes(roleId));

      const hasRecentActivation =
        user.profileActivatedAt &&
        new Date(user.profileActivatedAt).getTime() >
          Date.now() - 30 * 24 * 60 * 60 * 1000;

      // Puede aplicar al período de prueba si no tiene rol permitido, hay roles requeridos,
      // no ha activado el perfil aún, y es miembro del servidor
      const canApplyTrialPeriod =
        isServerMember &&
        !hasAllowedRole &&
        allowedRoles.length > 0 &&
        !user.profileActivatedAt;

      const canMakePublic =
        hasAllowedRole || 
        allowedRoles.length === 0 || 
        hasRecentActivation || 
        canApplyTrialPeriod;

      if (!canMakePublic) {
        return NextResponse.json(
          {
            error:
              "You need to have one of the allowed roles to make your profile public",
          },
          { status: 403 },
        );
      }
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

  if (contactLinks !== undefined) {
    if (!Array.isArray(contactLinks)) {
      return NextResponse.json(
        { error: "ContactLinks must be an array" },
        { status: 400 },
      );
    }
    // Validar cada URL del array
    for (const url of contactLinks) {
      if (typeof url !== "string") {
        return NextResponse.json(
          { error: "All contact links must be strings" },
          { status: 400 },
        );
      }
      if (url.trim() !== "" && !isValidUrl(url)) {
        return NextResponse.json(
          { error: `Invalid URL format: ${url}` },
          { status: 400 },
        );
      }
    }
    // Filtrar URLs vacías y limitar a 1 por ahora (preparado para futuro)
    const validLinks = contactLinks
      .filter((url) => typeof url === "string" && url.trim() !== "")
      .map((url) => url.trim())
      .slice(0, 1); // Limitar a 1 link por ahora
    updateData.contactLinks = validLinks;
  }

  if (contactEmail !== undefined) {
    if (contactEmail === null || contactEmail === "") {
      updateData.contactEmail = null;
    } else if (typeof contactEmail === "string") {
      if (!isValidEmail(contactEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }
      if (contactEmail.length > 255) {
        return NextResponse.json(
          { error: "Email must be 255 characters or less" },
          { status: 400 },
        );
      }
      updateData.contactEmail = contactEmail.trim();
    } else {
      return NextResponse.json(
        { error: "Invalid contactEmail value" },
        { status: 400 },
      );
    }
  }

  if (country !== undefined) {
    if (country === null || country === "") {
      updateData.country = null;
    } else if (typeof country === "string") {
      if (country.length !== 2) {
        return NextResponse.json(
          { error: "Country code must be 2 characters (ISO 3166-1 alpha-2)" },
          { status: 400 },
        );
      }
      updateData.country = country.toUpperCase().trim();
    } else {
      return NextResponse.json(
        { error: "Invalid country value" },
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
    contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    contactEmail: user.contactEmail,
    country: user.country,
    name: user.name,
    title: user.title,
    tags: user.tags,
    joinedServerAt: user.joinedServerAt,
    profileActivatedAt: user.profileActivatedAt,
  });
}
