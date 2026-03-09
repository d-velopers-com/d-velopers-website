import type { PostData } from "@/lib/posts";
import type { PublicUser } from "@/features/users";

export interface SerializedPost {
  id: string;
  title: string;
  iframe: string;
  sourceUrl?: string | null;
  embeddable: boolean;
  status: PostData["status"];
  createdBy?: PostData["createdBy"];
  updatedBy?: PostData["updatedBy"];
  createdAt: string;
  updatedAt: string;
}

type PublicUserRow = PublicUser & {
  description?: string | null;
  link?: string | null;
  contactLinks?: string[];
  contactEmail?: string | null;
  englishLevel?: string | null;
  availability?: string[];
  profileActivatedAt?: Date | string | null;
  joinedServerAt?: Date | string | null;
  createdAt?: Date | string | null;
};

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

export function serializePublicUsers(users: PublicUserRow[]): PublicUser[] {
  return users.map((user) => ({
    handler: user.handler,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    discordId: user.discordId,
    name: user.name,
    title: user.title,
    country: user.country,
    tags: Array.isArray(user.tags) ? user.tags : [],
    roles: Array.isArray(user.roles) ? user.roles : [],
    yoe: user.yoe,
    joinedServerAt: toIsoString(user.joinedServerAt),
    createdAt: toIsoString(user.createdAt) || new Date(0).toISOString(),
  }));
}

export function serializePost(post: PostData): SerializedPost {
  return {
    id: post.id,
    title: post.title,
    iframe: post.iframe,
    sourceUrl: post.sourceUrl,
    embeddable: post.embeddable,
    status: post.status,
    createdBy: post.createdBy,
    updatedBy: post.updatedBy,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function serializePosts(posts: PostData[]): SerializedPost[] {
  return posts.map(serializePost);
}
