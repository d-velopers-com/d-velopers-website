import {prisma} from "./prisma";

export interface PostData {
  id: string;
  title: string;
  iframe: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createPost(
  title: string,
  iframe: string,
): Promise<PostData> {
  return await prisma.post.create({
    data: {
      title,
      iframe,
    },
  });
}

export async function getPost(id: string): Promise<PostData | null> {
  return await prisma.post.findUnique({
    where: {id},
  });
}

export async function getPosts(
  limit: number = 10,
  offset: number = 0
): Promise<PostData[]> {
  return await prisma.post.findMany({
    take: limit,
    skip: offset,
    orderBy: {createdAt: "desc"},
  });
}

export async function getPostsCount(): Promise<number> {
  return await prisma.post.count();
}

export async function updatePost(
  id: string,
  title: string,
  iframe: string
): Promise<PostData> {
  return await prisma.post.update({
    where: {id},
    data: {
      title,
      iframe,
    },
  });
}

export async function deletePost(id: string): Promise<PostData> {
  return await prisma.post.delete({
    where: {id},
  });
}
