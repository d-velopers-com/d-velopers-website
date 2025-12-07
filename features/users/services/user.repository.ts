import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SearchFiltersInput } from "../schemas";

/**
 * Fields selected for public user data
 */
const PUBLIC_USER_SELECT = {
    handler: true,
    username: true,
    discriminator: true,
    avatar: true,
    discordId: true,
    name: true,
    title: true,
    country: true,
    tags: true,
    roles: true,
    yoe: true,
    joinedServerAt: true,
    createdAt: true,
} as const;

/**
 * Fields selected for full user profile
 */
const FULL_USER_SELECT = {
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
} as const;

/**
 * User repository - Data access layer for users
 */
export const userRepository = {
    /**
     * Find user by Discord ID
     */
    findByDiscordId: (discordId: string) =>
        prisma.user.findUnique({
            where: { discordId },
            select: FULL_USER_SELECT,
        }),

    /**
     * Find user by handler (public profile URL)
     */
    findByHandler: (handler: string) =>
        prisma.user.findUnique({
            where: { handler },
            select: FULL_USER_SELECT,
        }),

    /**
     * Find all public users with optional filters
     */
    findPublic: async (filters?: SearchFiltersInput) => {
        const where: Prisma.UserWhereInput = { isPublic: true };

        if (filters?.country) {
            where.country = filters.country;
        }
        if (filters?.english) {
            where.englishLevel = filters.english;
        }
        if (filters?.availability) {
            where.availability = { has: filters.availability };
        }
        if (filters?.q && filters.q.trim()) {
            const searchTerms = filters.q.trim().split(/\s+/);
            where.AND = searchTerms.map((term) => ({
                OR: [
                    { name: { contains: term, mode: "insensitive" as const } },
                    { title: { contains: term, mode: "insensitive" as const } },
                    { description: { contains: term, mode: "insensitive" as const } },
                    { tags: { has: term } },
                ],
            }));
        }

        return prisma.user.findMany({
            where,
            select: PUBLIC_USER_SELECT,
            orderBy: { createdAt: "desc" },
        });
    },

    /**
     * Update user profile
     */
    update: (discordId: string, data: Prisma.UserUpdateInput) =>
        prisma.user.update({
            where: { discordId },
            data: { ...data, updatedAt: new Date() },
        }),

    /**
     * Update user public status with first activation tracking
     */
    updatePublicStatus: async (discordId: string, isPublic: boolean) => {
        const user = await prisma.user.findUnique({
            where: { discordId },
            select: { isPublic: true, profileActivatedAt: true },
        });

        const updateData: Prisma.UserUpdateInput = { isPublic };

        // Track first-time profile activation
        if (isPublic && user && !user.isPublic && !user.profileActivatedAt) {
            updateData.profileActivatedAt = new Date();
        }

        return prisma.user.update({
            where: { discordId },
            data: updateData,
        });
    },
};
