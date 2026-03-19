import type { OGMetadata } from "@/types/og-metadata";

const LINKEDIN_FALLBACK_IMAGE =
  "https://static.licdn.com/aero-v1/sc/h/c45fy346jw096z9pbphyyhdz7";

/**
 * Decode HTML entities in a string (e.g. &amp; → &)
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

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

  if (ogMatch) return decodeHtmlEntities(ogMatch[1]);

  // Try reverse order (content before property)
  const ogMatchReverse = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`,
      "i",
    ),
  );

  if (ogMatchReverse) return decodeHtmlEntities(ogMatchReverse[1]);

  // Try twitter: prefix
  const twitterMatch = html.match(
    new RegExp(
      `<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
  );

  if (twitterMatch) return decodeHtmlEntities(twitterMatch[1]);

  // Try reverse for twitter
  const twitterMatchReverse = html.match(
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`,
      "i",
    ),
  );

  if (twitterMatchReverse) return decodeHtmlEntities(twitterMatchReverse[1]);

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

  // Use LinkedIn fallback only when no image was found
  if (originalUrl.includes("linkedin.com") && !metadata.image) {
    metadata.image = LINKEDIN_FALLBACK_IMAGE;
  }

  return metadata;
}
