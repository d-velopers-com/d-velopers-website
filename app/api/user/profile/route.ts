import type { SessionData } from "@/lib/session";

import { NextResponse } from "next/server";

import { getCountryByCode } from "@/lib/countries";
import {
  DiscordApiError,
  getGuildMember,
  refreshDiscordToken,
} from "@/lib/discord-oauth";
import { getProjectAccess } from "@/lib/project-access";
import {
  createSession,
  getSession,
  isDiscordTokenExpired,
} from "@/lib/session";
import {
  ProjectLimitExceededError,
  ProjectRoleVerificationRequiredError,
  updateUserProfile,
  updateUserRolesByDiscordId,
  getUserByDiscordId,
  type UserProjectInput,
} from "@/lib/user";
import { isSafeExternalUrl } from "@/lib/validations";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function isValidYOE(year: unknown) {
  const yearsNumber = Number(year);

  return (
    Number.isFinite(yearsNumber) &&
    Number.isInteger(yearsNumber) &&
    yearsNumber >= 0 &&
    yearsNumber <= 80
  );
}

async function getVerifiedDiscordRoles(
  session: SessionData,
): Promise<{ roles: string[] } | { response: NextResponse }> {
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return {
      response: NextResponse.json(
        { error: "Discord guild is not configured for project changes" },
        { status: 503 },
      ),
    };
  }

  let discordSession = session;

  if (
    !discordSession.accessToken ||
    isDiscordTokenExpired(discordSession.expiresAt)
  ) {
    if (!discordSession.refreshToken) {
      return {
        response: NextResponse.json(
          {
            error:
              "Discord authorization expired. Please sign in with Discord again.",
            reauthRequired: true,
          },
          { status: 401 },
        ),
      };
    }

    try {
      const tokenData = await refreshDiscordToken(discordSession.refreshToken);

      discordSession = {
        ...discordSession,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || discordSession.refreshToken,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
      };
    } catch {
      return {
        response: NextResponse.json(
          {
            error:
              "Discord authorization expired. Please sign in with Discord again.",
            reauthRequired: true,
          },
          { status: 401 },
        ),
      };
    }
  }

  const accessToken = discordSession.accessToken;

  if (!accessToken) {
    return {
      response: NextResponse.json(
        {
          error:
            "Discord authorization expired. Please sign in with Discord again.",
          reauthRequired: true,
        },
        { status: 401 },
      ),
    };
  }

  try {
    const memberData = await getGuildMember(accessToken, guildId);

    await createSession({ ...discordSession, roles: memberData.roles });
    await updateUserRolesByDiscordId(session.discordId, memberData.roles);

    return { roles: memberData.roles };
  } catch (error) {
    if (error instanceof DiscordApiError && error.status === 401) {
      return {
        response: NextResponse.json(
          {
            error:
              "Discord authorization expired. Please sign in with Discord again.",
            reauthRequired: true,
          },
          { status: 401 },
        ),
      };
    }

    return {
      response: NextResponse.json(
        { error: "Could not verify your Discord roles. Please try again." },
        { status: 503 },
      ),
    };
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
    contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    contactEmail: user.contactEmail,
    country: user.country,
    name: user.name,
    title: user.title,
    tags: user.tags,
    englishLevel: user.englishLevel,
    availability: Array.isArray(user.availability) ? user.availability : [],
    yoe: user.yoe,
    projects: user.projects,
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
    englishLevel,
    availability,
    yoe,
    projects,
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
    englishLevel?: string | null;
    availability?: string[];
    yoe?: number | null;
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
      if (!isSafeExternalUrl(link) || link.length > 2048) {
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
      if (url.trim() !== "" && (!isSafeExternalUrl(url) || url.length > 2048)) {
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
      const normalizedCountry = country.toUpperCase().trim();
      if (!getCountryByCode(normalizedCountry)) {
        return NextResponse.json(
          { error: "Country must be a supported ISO 3166-1 alpha-2 code" },
          { status: 400 },
        );
      }
      updateData.country = normalizedCountry;
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

  if (englishLevel !== undefined) {
    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (englishLevel === null || englishLevel === "") {
      updateData.englishLevel = null;
    } else if (typeof englishLevel === "string") {
      if (!validLevels.includes(englishLevel)) {
        return NextResponse.json(
          { error: `English level must be one of: ${validLevels.join(", ")}` },
          { status: 400 },
        );
      }
      updateData.englishLevel = englishLevel;
    } else {
      return NextResponse.json(
        { error: "Invalid englishLevel value" },
        { status: 400 },
      );
    }
  }

  if (yoe !== undefined) {
    if (!isValidYOE(yoe)) {
      return NextResponse.json(
        { error: `Please enter a valid years of experience` },
        { status: 400 },
      );
    }
    updateData.yoe = Number(yoe);
  }

  if (availability !== undefined) {
    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: "Availability must be an array" },
        { status: 400 },
      );
    }

    const validOptions = [
      "freelance",
      "part_time",
      "full_time",
      "consulting",
      "not_available",
    ];

    // Validar que todos los valores sean válidos
    for (const option of availability) {
      if (typeof option !== "string" || !validOptions.includes(option)) {
        return NextResponse.json(
          {
            error: `Invalid availability option. Must be one of: ${validOptions.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Si not_available está seleccionado, debe ser el único valor
    if (availability.includes("not_available")) {
      if (availability.length > 1) {
        return NextResponse.json(
          {
            error:
              "If 'not_available' is selected, no other options can be selected",
          },
          { status: 400 },
        );
      }
      updateData.availability = ["not_available"];
    } else {
      // Eliminar duplicados y ordenar
      const uniqueAvailability = Array.from(new Set(availability));
      updateData.availability = uniqueAvailability;
    }
  }

  let projectData: UserProjectInput[] | undefined;

  if (projects !== undefined) {
    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: "Projects must be an array" },
        { status: 400 },
      );
    }

    if (projects.length > 10) {
      return NextResponse.json(
        { error: "A maximum of 10 projects can be saved" },
        { status: 400 },
      );
    }

    projectData = [];

    for (const project of projects) {
      if (!project || typeof project !== "object" || Array.isArray(project)) {
        return NextResponse.json({ error: "Invalid project" }, { status: 400 });
      }

      const title =
        typeof project.title === "string" ? project.title.trim() : "";
      const url = typeof project.url === "string" ? project.url.trim() : "";
      const description =
        project.description === null || project.description === undefined
          ? null
          : typeof project.description === "string"
            ? project.description.trim() || null
            : undefined;
      const coverImageUrl =
        project.coverImageUrl === null || project.coverImageUrl === undefined
          ? null
          : typeof project.coverImageUrl === "string"
            ? project.coverImageUrl.trim() || null
            : undefined;

      if (!title || title.length > 100) {
        return NextResponse.json(
          { error: "Project titles must be between 1 and 100 characters" },
          { status: 400 },
        );
      }

      if (
        description === undefined ||
        (description && description.length > 500)
      ) {
        return NextResponse.json(
          { error: "Project descriptions must be 500 characters or less" },
          { status: 400 },
        );
      }

      if (
        coverImageUrl === undefined ||
        (coverImageUrl !== null &&
          (!isSafeExternalUrl(coverImageUrl) ||
            coverImageUrl.length > 2048 ||
            (() => {
              const imageUrl = new URL(coverImageUrl);
              return Boolean(imageUrl.username || imageUrl.password);
            })()))
      ) {
        return NextResponse.json(
          { error: "Cover image URLs must be valid HTTP or HTTPS URLs" },
          { status: 400 },
        );
      }

      if (!url || !isSafeExternalUrl(url)) {
        return NextResponse.json(
          { error: "Each project needs a valid HTTP or HTTPS URL" },
          { status: 400 },
        );
      }

      const normalizedUrl = new URL(url).href;

      if (normalizedUrl.length > 2048) {
        return NextResponse.json(
          { error: "Each project needs a valid HTTP or HTTPS URL" },
          { status: 400 },
        );
      }

      const normalizedCoverImageUrl = coverImageUrl
        ? new URL(coverImageUrl).href
        : null;

      projectData.push({
        title,
        description,
        url: normalizedUrl,
        coverImageUrl: normalizedCoverImageUrl,
      });
    }
  }

  let user;

  try {
    user = await updateUserProfile(session.discordId, updateData, projectData);
  } catch (error) {
    if (error instanceof ProjectLimitExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          limit: error.limit,
          currentCount: error.currentCount,
        },
        { status: 403 },
      );
    }

    if (error instanceof ProjectRoleVerificationRequiredError) {
      const verification = await getVerifiedDiscordRoles(session);

      if ("response" in verification) {
        return verification.response;
      }

      try {
        user = await updateUserProfile(
          session.discordId,
          updateData,
          projectData,
          verification.roles,
        );
      } catch (retryError) {
        if (retryError instanceof ProjectLimitExceededError) {
          return NextResponse.json(
            {
              error: retryError.message,
              limit: retryError.limit,
              currentCount: retryError.currentCount,
            },
            { status: 403 },
          );
        }

        throw retryError;
      }
    } else {
      throw error;
    }
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
    englishLevel: user.englishLevel,
    availability: Array.isArray(user.availability) ? user.availability : [],
    yoe: user.yoe,
    projects: user.projects,
    projectLimit: getProjectAccess(user.roles).limit,
    joinedServerAt: user.joinedServerAt,
    profileActivatedAt: user.profileActivatedAt,
  });
}
