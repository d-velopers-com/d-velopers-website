import { Metadata } from "next";
import { getUserByHandler } from "@/lib/user";
import { siteConfig } from "@/config/site";
import { en } from "@/locales/en";
import { getDiscordAvatarUrl } from "@/shared/lib";

type Props = {
  params: Promise<{ handler: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handler } = await params;
  const user = await getUserByHandler(handler);

  if (!user) {
    return {
      title: en.notFound.title,
      description: en.notFound.description,
    };
  }

  const displayName = user.name || user.username;
  const title = `${displayName}${user.title ? ` - ${user.title}` : ""} | ${siteConfig.name}`;
  const description =
    user.description ||
    `${displayName}${user.title ? ` - ${user.title}` : ""}${user.country ? ` from ${user.country}` : ""} on D-velopers. ${user.tags && user.tags.length > 0 ? `Technologies: ${user.tags.slice(0, 5).join(", ")}.` : ""}`;

  // Usar imagen más grande para mejor calidad en redes sociales
  const avatarUrl = getDiscordAvatarUrl(user.discordId, user.avatar, "0", 1024);

  const profileUrl = `${siteConfig.url}/users/${handler}`;

  // Extraer nombre y apellido si está disponible
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] || displayName;
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      url: profileUrl,
      locale: "en_US",
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: avatarUrl,
          width: 1024,
          height: 1024,
          alt: `${displayName}'s profile picture`,
          type: "image/png",
        },
      ],
    },
    other: {
      // Open Graph básicos
      "og:image:secure_url": avatarUrl,
      "og:image:type": "image/png",
      "og:image:width": "1024",
      "og:image:height": "1024",
      // Open Graph para perfiles
      "profile:username": handler,
      "profile:first_name": firstName,
      ...(lastName && { "profile:last_name": lastName }),
      // LinkedIn específico
      "og:image:url": avatarUrl,
      // Discord específico
      "theme-color": siteConfig.themeColor,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatarUrl],
      creator: "@d_velopers",
    },
  };
}

export default function HandlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
