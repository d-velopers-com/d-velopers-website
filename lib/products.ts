import { prisma } from "@/lib/prisma";
import {
  normalizeCoverImageFit,
  normalizeCoverImagePosition,
  normalizeCoverImageZoom,
  type ProjectCoverFit,
} from "@/lib/project-cover";

export const PRODUCTS_PAGE_SIZE = 24;

export interface ProductCreator {
  profilePublic: boolean;
  name: string | null;
  handler: string | null;
  discordId: string | null;
  discriminator: string | null;
  avatar: string | null;
}

export interface ProductListItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  coverImageUrl: string | null;
  coverImageFit: ProjectCoverFit;
  coverImagePositionX: number;
  coverImagePositionY: number;
  coverImageZoom: number;
  creator: ProductCreator;
}

export interface ProductsPage {
  products: ProductListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class InvalidProductsCursorError extends Error {
  constructor() {
    super("Invalid products cursor");
    this.name = "InvalidProductsCursorError";
  }
}

interface ProductsCursor {
  id: string;
  createdAt: Date;
}

function decodeCursor(token: string): ProductsCursor {
  if (token.length > 512) {
    throw new InvalidProductsCursorError();
  }

  try {
    const value: unknown = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    );

    if (!value || typeof value !== "object") {
      throw new InvalidProductsCursorError();
    }

    const cursor = value as Record<string, unknown>;
    if (
      typeof cursor.id !== "string" ||
      cursor.id.length === 0 ||
      cursor.id.length > 128 ||
      typeof cursor.createdAt !== "string"
    ) {
      throw new InvalidProductsCursorError();
    }

    const createdAt = new Date(cursor.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      throw new InvalidProductsCursorError();
    }

    return { id: cursor.id, createdAt };
  } catch (error) {
    if (error instanceof InvalidProductsCursorError) {
      throw error;
    }

    throw new InvalidProductsCursorError();
  }
}

function encodeCursor(cursor: ProductsCursor) {
  return Buffer.from(
    JSON.stringify({
      id: cursor.id,
      createdAt: cursor.createdAt.toISOString(),
    }),
  ).toString("base64url");
}

export async function getProductsPage(
  cursorToken?: string | null,
): Promise<ProductsPage> {
  const cursor = cursorToken ? decodeCursor(cursorToken) : null;
  const rows = await prisma.project.findMany({
    where: cursor
      ? {
          OR: [
            { createdAt: { lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, id: { lt: cursor.id } },
          ],
        }
      : undefined,
    take: PRODUCTS_PAGE_SIZE + 1,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      coverImageUrl: true,
      coverImageFit: true,
      coverImagePositionX: true,
      coverImagePositionY: true,
      coverImageZoom: true,
      createdAt: true,
      user: {
        select: {
          isPublic: true,
          name: true,
          username: true,
          handler: true,
          discordId: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });

  const hasMore = rows.length > PRODUCTS_PAGE_SIZE;
  const visibleRows = rows.slice(0, PRODUCTS_PAGE_SIZE);
  const lastRow = visibleRows.at(-1);

  return {
    products: visibleRows.map((row) => {
      const coverImageFit = normalizeCoverImageFit(row.coverImageFit);

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        url: row.url,
        coverImageUrl: row.coverImageUrl,
        coverImageFit,
        coverImagePositionX: normalizeCoverImagePosition(
          row.coverImagePositionX,
        ),
        coverImagePositionY: normalizeCoverImagePosition(
          row.coverImagePositionY,
        ),
        coverImageZoom: normalizeCoverImageZoom(
          row.coverImageZoom,
          coverImageFit,
        ),
        creator: row.user.isPublic
          ? {
              profilePublic: true,
              name: row.user.name || row.user.username,
              handler: row.user.handler,
              discordId: row.user.discordId,
              discriminator: row.user.discriminator,
              avatar: row.user.avatar,
            }
          : {
              profilePublic: false,
              name: null,
              handler: null,
              discordId: null,
              discriminator: null,
              avatar: null,
            },
      };
    }),
    nextCursor:
      hasMore && lastRow
        ? encodeCursor({ id: lastRow.id, createdAt: lastRow.createdAt })
        : null,
    hasMore,
  };
}
