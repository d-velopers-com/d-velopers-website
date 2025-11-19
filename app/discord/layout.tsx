import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Discord - D-velopers",
  description:
    "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community and connect with developers worldwide.",
  openGraph: {
    title: "Discord - D-velopers",
    description:
      "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community and connect with developers worldwide.",
    url: `${siteConfig.url}/discord`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: "D-velopers Discord",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord - D-velopers",
    description:
      "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
  other: {
    "theme-color": siteConfig.themeColor,
  },
};

export default function DiscordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
