import { Metadata } from "next";
import { getUserByHandler } from "@/lib/user";
import { siteConfig } from "@/config/site";
import { en } from "@/locales/en";

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

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=1024`
    : `https://cdn.discordapp.com/embed/avatars/0.png?size=1024`;

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `${siteConfig.url}/users/${handler}`,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: avatarUrl,
          width: 1024,
          height: 1024,
          alt: `${displayName}'s profile picture`,
        },
      ],
    },
    other: {
      "og:image:secure_url": avatarUrl,
      "theme-color": siteConfig.themeColor,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatarUrl],
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
