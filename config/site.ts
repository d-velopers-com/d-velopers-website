export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "D-VELOPERS",
  description: "Community of developers sharing their profiles and connecting.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.d-velopers.com",
  ogImage: "/opengraph-image", // Next.js will automatically serve this route
  themeColor: "#0284C7", // Primary blue color
};
