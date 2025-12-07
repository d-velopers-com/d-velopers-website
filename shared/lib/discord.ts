/**
 * Discord CDN base URL
 */
const DISCORD_CDN = "https://cdn.discordapp.com";

/**
 * Get Discord avatar URL for a user
 * @param discordId - User's Discord ID
 * @param avatar - Avatar hash or null
 * @param discriminator - User's discriminator (for default avatar calculation)
 * @param size - Image size (default: undefined for original size)
 */
export function getDiscordAvatarUrl(
    discordId: string,
    avatar: string | null,
    discriminator: string,
    size?: number
): string {
    const sizeParam = size ? `?size=${size}` : "";

    if (avatar) {
        return `${DISCORD_CDN}/avatars/${discordId}/${avatar}.png${sizeParam}`;
    }

    // Default avatar based on discriminator
    const defaultIndex = parseInt(discriminator) % 5;
    return `${DISCORD_CDN}/embed/avatars/${defaultIndex}.png${sizeParam}`;
}

/**
 * Get Discord avatar URL using user ID for new username system
 * @param userId - User's Discord ID (used for default avatar in new system)
 * @param avatar - Avatar hash or null
 * @param size - Image size
 */
export function getDiscordAvatarUrlNew(
    userId: string,
    avatar: string | null,
    size?: number
): string {
    const sizeParam = size ? `?size=${size}` : "";

    if (avatar) {
        return `${DISCORD_CDN}/avatars/${userId}/${avatar}.png${sizeParam}`;
    }

    // For new username system, use (user_id >> 22) % 6
    const defaultIndex = (BigInt(userId) >> BigInt(22)) % BigInt(6);
    return `${DISCORD_CDN}/embed/avatars/${defaultIndex}.png${sizeParam}`;
}
