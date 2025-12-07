import { Availability } from "@/shared/constants";

/**
 * Public user data shown in listings and cards
 */
export interface PublicUser {
    handler: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    discordId: string;
    name: string | null;
    title: string | null;
    country: string | null;
    tags: string[];
    roles: string[];
    yoe: number | null;
    joinedServerAt: string | null;
    createdAt: string;
}

/**
 * Full user profile data including private fields
 */
export interface UserProfile extends PublicUser {
    id: string;
    email: string | null;
    isPublic: boolean;
    description: string | null;
    link: string | null;
    contactLinks: string[];
    contactEmail: string | null;
    englishLevel: string | null;
    availability: Availability[];
    profileActivatedAt: string | null;
    updatedAt: string;
}

/**
 * Data required to update a user profile
 */
export interface UpdateUserProfileInput {
    name?: string | null;
    title?: string | null;
    description?: string | null;
    country?: string | null;
    englishLevel?: string | null;
    tags?: string[];
    availability?: Availability[];
    yoe?: number | null;
    contactEmail?: string | null;
    contactLinks?: string[];
    link?: string | null;
    isPublic?: boolean;
}
