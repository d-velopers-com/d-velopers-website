import { Metadata } from "next";
import { getUserByHandler } from "@/lib/user";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ handler: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handler } = await params;
  const user = await getUserByHandler(handler);

  if (!user) {
    return {
      title: "User Not Found",
      description: "The requested user profile could not be found.",
    };
  }

  const displayName = user.name || user.username;
  const title = `${displayName}${user.title ? ` - ${user.title}` : ""} | ${siteConfig.name}`;
  const description = user.description || 
    `${displayName}${user.title ? ` - ${user.title}` : ""}${user.country ? ` from ${user.country}` : ""} on D-velopers. ${user.tags && user.tags.length > 0 ? `Technologies: ${user.tags.slice(0, 5).join(", ")}.` : ""}`;
  
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=512`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

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
          width: 512,
          height: 512,
          alt: `${displayName}'s profile picture`,
        },
      ],
    },
    other: {
      "og:image:secure_url": avatarUrl,
      "theme-color": siteConfig.themeColor,
      "og:theme-color": siteConfig.themeColor,
    },
    twitter: {
      card: "summary",
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

