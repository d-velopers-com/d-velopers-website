import { prisma } from "./prisma";

interface CreateUserData {
  discordId: string;
  username: string;
  discriminator: string;
  email: string | null;
  avatar: string | null;
  roles: string[];
  joinedServerAt?: string | null;
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
    return await prisma.user.update({
      where: { discordId: data.discordId },
      data: {
        username: data.username,
        discriminator: data.discriminator,
        email: data.email,
        avatar: data.avatar,
        roles: data.roles,
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
      name: true,
      title: true,
      tags: true,
      roles: true,
      joinedServerAt: true,
      createdAt: true,
      updatedAt: true,
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
      name: true,
      title: true,
      tags: true,
      roles: true,
      joinedServerAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserPublicStatus(
  discordId: string,
  isPublic: boolean,
) {
  return await prisma.user.update({
    where: { discordId },
    data: { isPublic },
  });
}

export async function updateUserProfile(
  discordId: string,
  data: {
    isPublic?: boolean;
    description?: string | null;
    link?: string | null;
    name?: string | null;
    title?: string | null;
    tags?: string[];
  },
) {
  return await prisma.user.update({
    where: { discordId },
    data,
  });
}

export async function getPublicUsers() {
  return await prisma.user.findMany({
    where: { isPublic: true },
    select: {
      handler: true,
      username: true,
      discriminator: true,
      avatar: true,
      discordId: true,
      description: true,
      link: true,
      name: true,
      title: true,
      tags: true,
      roles: true,
      joinedServerAt: true,
      createdAt: true,
    },
  });
}
