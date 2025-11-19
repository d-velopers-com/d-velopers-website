import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Discord - D-velopers",
  description: "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community and connect with developers worldwide.",
  openGraph: {
    title: "Discord - D-velopers",
    description: "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community and connect with developers worldwide.",
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
    description: "Unlock your Discord access with a YouTube/Twitch subscription. Join the D-velopers community.",
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
  other: {
    "theme-color": siteConfig.themeColor,
    "og:theme-color": siteConfig.themeColor,
  },
};

export default function DiscordPage() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 64px)", minHeight: "600px" }}>
      <iframe
        src="/discord/index.html"
        className="w-full h-full"
        style={{ border: "none", display: "block" }}
        title="Discord landing"
      />
    </div>
  );
}

