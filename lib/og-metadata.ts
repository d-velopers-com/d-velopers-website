import type { OGMetadata } from "@/types/og-metadata";

const LINKEDIN_FALLBACK_IMAGE =
  "https://static.licdn.com/aero-v1/sc/h/c45fy346jw096z9pbphyyhdz7";

/**
 * Extract meta tag content by property name
 * Checks og: prefix, twitter: prefix, and both attribute orderings
 */
function getMetaContent(html: string, property: string): string | undefined {
  // Try og: prefix
  const ogMatch = html.match(
    new RegExp(
      `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
  );

  if (ogMatch) return ogMatch[1];

  // Try reverse order (content before property)
  const ogMatchReverse = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`,
      "i",
    ),
  );

  if (ogMatchReverse) return ogMatchReverse[1];

  // Try twitter: prefix
  const twitterMatch = html.match(
    new RegExp(
      `<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
  );

  if (twitterMatch) return twitterMatch[1];

  // Try reverse for twitter
  const twitterMatchReverse = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`,
      "i",
    ),
  );

  if (twitterMatchReverse) return twitterMatchReverse[1];

  return undefined;
}

/**
 * Parse OG metadata from HTML
 */
export function parseOGMetadata(html: string, originalUrl: string): OGMetadata {
  const metadata: OGMetadata = {
    url: originalUrl,
  };

  // Extract metadata
  metadata.title = getMetaContent(html, "title");
  metadata.description = getMetaContent(html, "description");
  metadata.image = getMetaContent(html, "image");
  metadata.siteName = getMetaContent(html, "site_name");

  // Fallback: get title from <title> tag if no OG title
  if (!metadata.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
  }

  // Fallback: get description from meta description
  if (!metadata.description) {
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );

    if (descMatch) {
      metadata.description = descMatch[1];
    }
  }

  // Make image URL absolute if relative
  if (metadata.image && !metadata.image.startsWith("http")) {
    try {
      const baseUrl = new URL(originalUrl);

      metadata.image = new URL(metadata.image, baseUrl.origin).href;
    } catch {
      // Keep as-is if URL parsing fails
    }
  }

  // LinkedIn post/feed URLs return signed image URLs that expire quickly,
  // making them unreliable. Discard them and use the fallback instead.
  // Profile and company pages have stable OG images, so keep those.
  if (originalUrl.includes("linkedin.com")) {
    const isPostUrl = /linkedin\.com\/(posts|feed\/update)\//i.test(
      originalUrl,
    );

    if (isPostUrl || !metadata.image) {
      metadata.image = LINKEDIN_FALLBACK_IMAGE;
    }
  }

  return metadata;
}
