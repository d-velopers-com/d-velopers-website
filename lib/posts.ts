import {prisma} from "./prisma";

export interface PostAuthor {
  id: string;
  username: string;
  avatar: string | null;
}

export interface PostData {
  id: string;
  title: string;
  iframe: string;
  createdBy?: PostAuthor | null;
  updatedBy?: PostAuthor | null;
  createdAt: Date;
  updatedAt: Date;
}

const authorSelect = {
  id: true,
  username: true,
  avatar: true,
};

export async function createPost(
  title: string,
  iframe: string,
  userId: string,
): Promise<PostData> {
  return await prisma.post.create({
    data: {
      title,
      iframe,
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
    where: {id},
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function getPosts(
  limit: number = 10,
  offset: number = 0,
  orConditions: Array<{ title: { contains: string, mode: string } }> = [],
): Promise<PostData[]> {
  return await prisma.post.findMany({
    where: orConditions.length > 0 ? { OR: orConditions } : {},
    take: limit,
    skip: offset,
    orderBy: {createdAt: "desc"},
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}

export async function getPostsCount(
  orConditions: Array<{ title: { contains: string, mode: string } }> = [],
): Promise<number> {
  return await prisma.post.count({
    where: orConditions.length > 0 ? { OR: orConditions } : {},
  });
}

export async function updatePost(
  id: string,
  title: string,
  iframe: string,
  userId: string,
): Promise<PostData> {
  return await prisma.post.update({
    where: {id},
    data: {
      title,
      iframe,
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
    where: {id},
    include: {
      createdBy: { select: authorSelect },
      updatedBy: { select: authorSelect },
    },
  });
}
