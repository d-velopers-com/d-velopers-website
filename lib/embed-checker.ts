/**
 * Utility to check if an embed URL is accessible
 */

/**
 * Extracts the embed URL from iframe HTML
 */
export function extractEmbedUrl(iframeHtml: string): string | null {
  const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
  return srcMatch ? srcMatch[1] : null;
}

/**
 * Known embed URL patterns that are trusted without verification
 * These URLs are specifically designed for embedding and don't need server-side checks
 */
const TRUSTED_EMBED_PATTERNS = [
  // LinkedIn official embed URLs
  /^https:\/\/www\.linkedin\.com\/embed\/feed\/update\//,
  // Twitter/X official embed URLs
  /^https:\/\/platform\.twitter\.com\/embed\//,
  /^https:\/\/platform\.x\.com\/embed\//,
];

/**
 * Checks if a URL is a known trusted embed URL
 */
export function isTrustedEmbedUrl(url: string): boolean {
  return TRUSTED_EMBED_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Checks if any URL can be embedded by making a HEAD request
 * Returns true if the embed is likely to work, false otherwise
 */
export async function checkEmbedAccessibility(url: string): Promise<boolean> {
  if (!url || url === "about:blank") {
    return false;
  }

  // Never fetch a user-provided URL from the server. Doing so would expose
  // internal services to SSRF. Known official embed endpoints are sufficient.
  return isTrustedEmbedUrl(url);
}

/**
 * Checks if an iframe HTML content can be embedded
 * @param iframeHtml - The iframe HTML string
 */
export async function checkIframeEmbedAccessibility(
  iframeHtml: string,
): Promise<boolean> {
  const embedUrl = extractEmbedUrl(iframeHtml);

  if (!embedUrl) {
    return false;
  }

  return checkEmbedAccessibility(embedUrl);
}

/**
 * Legacy function - kept for backwards compatibility
 * @deprecated Use checkIframeEmbedAccessibility instead
 */
export async function checkLinkedInEmbedAccessibility(
  iframeHtml: string,
): Promise<boolean> {
  return checkIframeEmbedAccessibility(iframeHtml);
}
