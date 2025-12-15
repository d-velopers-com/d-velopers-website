import { prisma } from './prisma';

export const CONFIG_KEYS = {
    AUTO_APPROVE_BOT_POSTS: 'autoApproveBotPosts',
} as const;

export type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS];

/**
 * Get a system config value
 */
export async function getConfig(key: ConfigKey): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({
        where: { key },
    });
    return config?.value ?? null;
}

/**
 * Get a system config value as boolean
 */
export async function getConfigBoolean(key: ConfigKey): Promise<boolean> {
    const value = await getConfig(key);
    return value === 'true';
}

/**
 * Set a system config value
 */
export async function setConfig(key: ConfigKey, value: string): Promise<void> {
    await prisma.systemConfig.upsert({
        where: { key },
        update: { value },
        create: {
            id: key,
            key,
            value
        },
    });
}

/**
 * Check if bot posts should be auto-approved
 */
export async function shouldAutoApproveBotPosts(): Promise<boolean> {
    return getConfigBoolean(CONFIG_KEYS.AUTO_APPROVE_BOT_POSTS);
}
