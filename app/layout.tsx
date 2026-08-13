import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/toaster";
import { fontSans, fontMono } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { getNavbarViewerContext } from "@/lib/viewer";
import { en } from "@/locales/en";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["developers", "community", "profiles", "discord", "programming"],
  authors: [{ name: "D-velopers" }],
  creator: "D-velopers",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
        type: "image/png",
      },
    ],
  },
  other: {
    "theme-color": siteConfig.themeColor,
    "og:image:secure_url": `${siteConfig.url}${siteConfig.ogImage}`,
    "og:image:type": "image/png",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: "@d_velopers",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/png_logo.png",
  },
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getNavbarViewerContext();
  const shouldRenderAnalytics =
    process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <Providers
          initialSession={viewer.session}
          themeProps={{ attribute: "class", defaultTheme: "dark" }}
        >
          <a
            className="sr-only z-[100] rounded-md bg-background px-4 py-3 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-primary"
            href="#main-content"
          >
            {en.common.skipToContent}
          </a>
          <div className="flex flex-col min-h-screen">
            <Navbar permissions={viewer.permissions} session={viewer.session} />
            <main className="flex-grow" id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
        {shouldRenderAnalytics ? <Analytics /> : null}
      </body>
    </html>
  );
}
