import { prisma } from "./prisma";
import { PostStatus } from "@prisma/client";

export interface PostAuthor {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
}

export interface PostData {
  id: string;
  title: string;
  iframe: string;
  sourceUrl?: string | null;
  status: PostStatus;
  createdBy?: PostAuthor | null;
  updatedBy?: PostAuthor | null;
  createdAt: Date;
  updatedAt: Date;
}

const authorSelect = {
  id: true,
  discordId: true,
  username: true,
  avatar: true,
};

export async function createPost(
  title: string,
  iframe: string,
  userId: string,
  sourceUrl?: string,
): Promise<PostData> {
  return await prisma.post.create({
    data: {
      title,
      iframe,
      sourceUrl,
      status: PostStatus.PENDING,
      createdById: userId,
      updatedById: userId,
    },
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function getPost(id: string): Promise<PostData | null> {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function getPosts(
  limit: number = 10,
  offset: number = 0,
  orConditions: Array<{ title: { contains: string, mode: 'insensitive' } }> = [],
  createdById?: string,
  status?: PostStatus | null,
): Promise<PostData[]> {
  const where: any = {};

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  if (createdById) {
    where.createdById = createdById;
  }

  if (status) {
    where.status = status;
  }

  return await prisma.post.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function getPostsCount(
  orConditions: Array<{ title: { contains: string, mode: 'insensitive' } }> = [],
  createdById?: string,
  status?: PostStatus | null,
): Promise<number> {
  const where: any = {};

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  if (createdById) {
    where.createdById = createdById;
  }

  if (status) {
    where.status = status;
  }

  return await prisma.post.count({ where });
}

export async function updatePost(
  id: string,
  title: string,
  iframe: string,
  userId: string,
  sourceUrl?: string,
  status?: PostStatus,
): Promise<PostData> {
  return await prisma.post.update({
    where: { id },
    data: {
      title,
      iframe,
      sourceUrl,
      ...(status && { status }),
      updatedById: userId,
    },
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function deletePost(id: string): Promise<PostData> {
  return await prisma.post.delete({
    where: { id },
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}
