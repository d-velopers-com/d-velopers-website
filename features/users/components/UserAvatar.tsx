"use client";

import { memo } from "react";
import { Avatar } from "@heroui/avatar";
import { getCountryFlagUrl, getCountryName } from "@/lib/countries";

export interface UserAvatarProps {
    avatar: string | null;
    discordId: string;
    discriminator: string;
    country?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_CLASSES = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
} as const;

const FLAG_SIZE_CLASSES = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
} as const;

/**
 * User avatar component with optional country flag overlay
 */
export const UserAvatar = memo(function UserAvatar({
    avatar,
    discordId,
    discriminator,
    country,
    size = "md",
    className = "",
}: UserAvatarProps) {
    const avatarUrl = avatar
        ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`;

    const flagUrl = country ? getCountryFlagUrl(country, "24") : null;
    const countryName = country ? getCountryName(country) : null;

    return (
        <div className={`relative ${SIZE_CLASSES[size]} flex-shrink-0 ${className}`}>
            <Avatar
                className={`${SIZE_CLASSES[size]} ring-2 ring-background`}
                src={avatarUrl}
            />
            {flagUrl && countryName && (
                <div
                    className={`absolute -bottom-0.5 -right-0.5 ${FLAG_SIZE_CLASSES[size]} rounded-full border-2 border-background bg-background flex items-center justify-center overflow-hidden shadow-sm`}
                >
                    <img
                        alt={countryName}
                        className="w-full h-full object-cover rounded-full"
                        src={flagUrl}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            )}
        </div>
    );
});
