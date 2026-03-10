import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { SearchFilters } from "@/types";

interface CreateUserData {
  discordId: string;
  username: string;
  discriminator: string;
  email: string | null;
  avatar: string | null;
  roles: string[];
  joinedServerAt?: string | null;
  isMember?: boolean; // Si es true, el usuario está confirmado en el servidor
}

type PublicUserRow = {
  roles: string[];
  joinedServerAt?: Date | string | null;
};

export const PUBLIC_USERS_PAGE_SIZE = 12;

function getAllowedRoles(): string[] {
  return (process.env.ALLOWED_ROLES || "")
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
}

function getRolePriority(userRoles: string[], allowedRoles: string[]): number {
  for (let i = 0; i < allowedRoles.length; i++) {
    if (userRoles.includes(allowedRoles[i])) {
      return i;
    }
  }

  return allowedRoles.length;
}

function getJoinedServerAtTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return new Date(value).getTime();
}

export function sortPublicUsersByPriority<T extends PublicUserRow>(users: T[]): T[] {
  const allowedRoles = getAllowedRoles();

  return [...users].sort((a, b) => {
    const aPriority = getRolePriority(
      Array.isArray(a.roles) ? a.roles : [],
      allowedRoles,
    );
    const bPriority = getRolePriority(
      Array.isArray(b.roles) ? b.roles : [],
      allowedRoles,
    );

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    const aJoinedAt = getJoinedServerAtTimestamp(a.joinedServerAt);
    const bJoinedAt = getJoinedServerAtTimestamp(b.joinedServerAt);

    if (aJoinedAt !== null && bJoinedAt !== null) {
      return aJoinedAt - bJoinedAt;
    }

    if (aJoinedAt !== null) {
      return -1;
    }

    if (bJoinedAt !== null) {
      return 1;
    }

    return 0;
  });
}

function generateHandler(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function findUniqueHandler(baseHandler: string): Promise<string> {
  let handler = baseHandler;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { handler },
    });

    if (!existing) {
      return handler;
    }

    handler = `${baseHandler}${counter}`;
    counter++;
  }
}

export async function upsertUser(data: CreateUserData) {
  const existingUser = await prisma.user.findUnique({
    where: { discordId: data.discordId },
  });

  if (existingUser) {
    // Protección: Solo actualizar roles si:
    // 1. isMember es true (confirmamos que el usuario está en el servidor), o
    // 2. Los nuevos roles NO están vacíos, o
    // 3. El usuario no tenía roles de todos modos
    const shouldUpdateRoles =
      data.isMember === true ||
      data.roles.length > 0 ||
      existingUser.roles.length === 0;

    return await prisma.user.update({
      where: { discordId: data.discordId },
      data: {
        username: data.username,
        discriminator: data.discriminator,
        email: data.email,
        avatar: data.avatar,
        ...(shouldUpdateRoles && { roles: data.roles }),
        joinedServerAt: data.joinedServerAt
          ? new Date(data.joinedServerAt)
          : null,
        updatedAt: new Date(),
      },
    });
  }

  const baseHandler = generateHandler(data.username);
  const uniqueHandler = await findUniqueHandler(baseHandler);

  return await prisma.user.create({
    data: {
      discordId: data.discordId,
      username: data.username,
      discriminator: data.discriminator,
      email: data.email,
      avatar: data.avatar,
      handler: uniqueHandler,
      roles: data.roles,
      joinedServerAt: data.joinedServerAt
        ? new Date(data.joinedServerAt)
        : null,
      isPublic: false,
    },
  });
}

export async function getUserByDiscordId(discordId: string) {
  return await prisma.user.findUnique({
    where: { discordId },
    select: {
      id: true,
      discordId: true,
      username: true,
      discriminator: true,
      email: true,
      avatar: true,
      handler: true,
      isPublic: true,
      description: true,
      link: true,
      contactLinks: true,
      contactEmail: true,
      country: true,
      name: true,
      title: true,
      tags: true,
      englishLevel: true,
      availability: true,
      yoe: true,
      roles: true,
      joinedServerAt: true,
      profileActivatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserAccessStateByDiscordId(discordId: string) {
  return await prisma.user.findUnique({
    where: { discordId },
    select: {
      profileActivatedAt: true,
    },
  });
}

export async function getUserByHandler(handler: string) {
  return await prisma.user.findUnique({
    where: { handler },
    select: {
      id: true,
      discordId: true,
      username: true,
      discriminator: true,
      email: true,
      avatar: true,
      handler: true,
      isPublic: true,
      description: true,
      link: true,
      contactLinks: true,
      contactEmail: true,
      country: true,
      name: true,
      title: true,
      tags: true,
      englishLevel: true,
      availability: true,
      yoe: true,
      roles: true,
      joinedServerAt: true,
      profileActivatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserPublicStatus(
  discordId: string,
  isPublic: boolean,
) {
  const user = await prisma.user.findUnique({
    where: { discordId },
    select: { isPublic: true, profileActivatedAt: true },
  });

  const updateData: { isPublic: boolean; profileActivatedAt?: Date } = {
    isPublic,
  };

  // Si el perfil se está activando por primera vez (cambiando de false a true)
  if (isPublic && user && !user.isPublic && !user.profileActivatedAt) {
    updateData.profileActivatedAt = new Date();
  }

  return await prisma.user.update({
    where: { discordId },
    data: updateData,
  });
}

export async function updateUserProfile(
  discordId: string,
  data: {
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
  },
) {
  // Si se está activando el perfil, verificar si es la primera vez
  if (data.isPublic === true) {
    const user = await prisma.user.findUnique({
      where: { discordId },
      select: { isPublic: true, profileActivatedAt: true },
    });

    // Si el perfil se está activando por primera vez
    if (user && !user.isPublic && !user.profileActivatedAt) {
      return await prisma.user.update({
        where: { discordId },
        data: {
          ...data,
          profileActivatedAt: new Date(),
        },
      });
    }
  }

  return await prisma.user.update({
    where: { discordId },
    data,
  });
}

function buildPublicUserConditions(filters?: SearchFilters) {
  const conditions: Prisma.Sql[] = [Prisma.sql`"isPublic" = true`];

  if (filters?.searchQuery) {
    const searchTerms = filters.searchQuery.trim().split(/\s+/).filter(term => term.length > 0);
    const searchConditions: Prisma.Sql[] = [];

    for (const term of searchTerms) {
      const sanitizedTerm = term.slice(0, 100);
      const query = `%${sanitizedTerm}%`;
      searchConditions.push(Prisma.sql`(
        LOWER(title) LIKE LOWER(${query}) OR
        LOWER(description) LIKE LOWER(${query}) OR
        LOWER(name) LIKE LOWER(${query}) OR
        EXISTS (
          SELECT 1 FROM unnest(tags) AS tag
          WHERE LOWER(tag) LIKE LOWER(${query})
        )
      )`);
    }

    if (searchConditions.length > 0) {
      conditions.push(Prisma.sql`(${Prisma.join(searchConditions, " AND ")})`);
    }
  }

  if (filters?.english) {
    conditions.push(Prisma.sql`"englishLevel" = ${filters.english}`);
  }

  if (filters?.availability) {
    conditions.push(Prisma.sql`${filters.availability} = ANY(availability)`);
  }

  if (filters?.country) {
    conditions.push(Prisma.sql`country = ${filters.country}`);
  }

  return conditions;
}

function buildPublicUserOrderClause() {
  const allowedRoles = getAllowedRoles();

  if (allowedRoles.length === 0) {
    return Prisma.sql`"joinedServerAt" ASC NULLS LAST, "createdAt" DESC`;
  }

  const rolePriority = Prisma.sql`
    CASE
      ${Prisma.join(
        allowedRoles.map((role, index) => Prisma.sql`
          WHEN ${role} = ANY(roles) THEN ${index}
        `),
        " ",
      )}
      ELSE ${allowedRoles.length}
    END
  `;

  return Prisma.sql`
    ${rolePriority} ASC,
    "joinedServerAt" ASC NULLS LAST,
    "createdAt" DESC
  `;
}

async function queryPublicUsers(
  filters?: SearchFilters,
  pagination?: { limit: number; offset: number },
) {
  const whereClause = Prisma.join(buildPublicUserConditions(filters), " AND ");
  const orderClause = buildPublicUserOrderClause();

  if (pagination) {
    return prisma.$queryRaw<any[]>`
      SELECT
        handler,
        username,
        discriminator,
        avatar,
        "discordId",
        description,
        link,
        "contactLinks",
        "contactEmail",
        country,
        name,
        title,
        tags,
        "englishLevel",
        availability,
        "yoe",
        roles,
        "joinedServerAt",
        "profileActivatedAt",
        "createdAt"
      FROM "User"
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ${pagination.limit}
      OFFSET ${pagination.offset}
    `;
  }

  return prisma.$queryRaw<any[]>`
    SELECT
      handler,
      username,
      discriminator,
      avatar,
      "discordId",
      description,
      link,
      "contactLinks",
      "contactEmail",
      country,
      name,
      title,
      tags,
      "englishLevel",
      availability,
      "yoe",
      roles,
      "joinedServerAt",
      "profileActivatedAt",
      "createdAt"
    FROM "User"
    WHERE ${whereClause}
    ORDER BY ${orderClause}
  `;
}

export async function getPublicUsers(filters?: SearchFilters) {
  return queryPublicUsers(filters);
}

export async function getPublicUsersPage(
  filters?: SearchFilters,
  options?: { page?: number; limit?: number },
) {
  const limit =
    options?.limit && Number.isFinite(options.limit) && options.limit > 0
      ? Math.min(Math.floor(options.limit), 100)
      : PUBLIC_USERS_PAGE_SIZE;

  const whereClause = Prisma.join(buildPublicUserConditions(filters), " AND ");
  const countResult = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS count
    FROM "User"
    WHERE ${whereClause}
  `;

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  const requestedPage =
    options?.page && Number.isFinite(options.page) && options.page > 0
      ? Math.floor(options.page)
      : 1;
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * limit;
  const users =
    total > 0
      ? await queryPublicUsers(filters, { limit, offset })
      : [];

  return {
    users,
    total,
    page,
    totalPages,
    limit,
  };
}
