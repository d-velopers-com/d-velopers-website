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
function isTrustedEmbedUrl(url: string): boolean {
    return TRUSTED_EMBED_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Checks if any URL can be embedded by making a HEAD request
 * Returns true if the embed is likely to work, false otherwise
 */
export async function checkEmbedAccessibility(url: string): Promise<boolean> {
    if (!url || url === 'about:blank') {
        return false;
    }

    // Trust known embed URLs without making network requests
    // These URLs are from official embed endpoints and are always embeddable
    if (isTrustedEmbedUrl(url)) {
        return true;
    }

    try {
        // Make a HEAD request to check if the URL is accessible
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EmbedChecker/1.0)',
            },
        });

        clearTimeout(timeoutId);

        // Check if response is OK
        if (!response.ok) {
            return false;
        }

        // Check for X-Frame-Options header that might block embedding
        const xFrameOptions = response.headers.get('X-Frame-Options');
        if (xFrameOptions) {
            const upper = xFrameOptions.toUpperCase();
            if (upper === 'DENY' || upper === 'SAMEORIGIN') {
                return false;
            }
        }

        // Check Content-Security-Policy for frame-ancestors
        const csp = response.headers.get('Content-Security-Policy');
        if (csp && csp.includes('frame-ancestors')) {
            // If frame-ancestors doesn't include * or 'self', it blocks embedding
            if (!csp.includes('frame-ancestors *') && !csp.includes("frame-ancestors 'self'")) {
                // More restrictive check - if it has frame-ancestors with specific domains
                if (csp.match(/frame-ancestors\s+(?:(?![\*])[^\s;]+)/)) {
                    return false;
                }
            }
        }

        return true;
    } catch (error) {
        // Network error, timeout, CORS, or other issue
        console.error('Error checking embed accessibility:', error);
        // For CORS errors (which are common), we can't determine - assume embeddable
        // The browser will handle the actual embedding
        return true;
    }
}

/**
 * Checks if an iframe HTML content can be embedded
 * @param iframeHtml - The iframe HTML string
 */
export async function checkIframeEmbedAccessibility(iframeHtml: string): Promise<boolean> {
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
export async function checkLinkedInEmbedAccessibility(iframeHtml: string): Promise<boolean> {
    return checkIframeEmbedAccessibility(iframeHtml);
}

