import Image from "next/image";

import { getCountryFlagUrl, getCountryName } from "@/lib/countries";
import { getDiscordAvatarProxyUrl } from "@/shared/lib";

export interface UserAvatarProps {
  avatar: string | null;
  discordId: string;
  discriminator: string;
  country?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const FLAG_SIZE_CLASSES = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

const IMAGE_SIZES = {
  sm: 32,
  md: 48,
  lg: 64,
} as const;

const FLAG_SIZES = {
  sm: 12,
  md: 16,
  lg: 20,
} as const;

export function UserAvatar({
  avatar,
  discordId,
  discriminator,
  country,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const avatarSize = IMAGE_SIZES[size];
  const flagSize = FLAG_SIZES[size];
  const avatarUrl = getDiscordAvatarProxyUrl(
    discordId,
    avatar,
    discriminator,
    avatarSize * 2,
  );
  const flagUrl = country ? getCountryFlagUrl(country, "24") : null;
  const countryName = country ? getCountryName(country) : null;

  return (
    <div className={`relative flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`}>
      <div
        className={`${SIZE_CLASSES[size]} overflow-hidden rounded-full bg-default-100 ring-2 ring-background`}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          height={avatarSize}
          sizes={`${avatarSize}px`}
          src={avatarUrl}
          width={avatarSize}
        />
      </div>
      {flagUrl && countryName ? (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${FLAG_SIZE_CLASSES[size]} overflow-hidden rounded-full border-2 border-background bg-background shadow-sm`}
        >
          <Image
            alt={countryName}
            className="h-full w-full object-cover"
            height={flagSize}
            sizes={`${flagSize}px`}
            src={flagUrl}
            width={flagSize}
          />
        </div>
      ) : null}
    </div>
  );
}
