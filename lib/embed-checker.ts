/**
 * Utility to check if a LinkedIn embed URL is accessible
 */

/**
 * Extracts the embed URL from iframe HTML
 */
export function extractEmbedUrl(iframeHtml: string): string | null {
    const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : null;
}

/**
 * Checks if a LinkedIn embed URL is accessible by making a HEAD request
 * Returns true if the embed is likely to work, false otherwise
 */
export async function checkLinkedInEmbedAccessibility(iframeHtml: string): Promise<boolean> {
    const embedUrl = extractEmbedUrl(iframeHtml);

    if (!embedUrl) {
        return false;
    }

    // Only check LinkedIn embed URLs
    if (!embedUrl.includes('linkedin.com/embed')) {
        // For non-LinkedIn embeds, assume they work
        return true;
    }

    try {
        // Make a HEAD request to check if the embed URL is accessible
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(embedUrl, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EmbedChecker/1.0)',
            },
        });

        clearTimeout(timeoutId);

        // LinkedIn returns 200 for valid embeds, various error codes for invalid ones
        // Some posts return 200 but with X-Frame-Options that block embedding
        if (!response.ok) {
            return false;
        }

        // Check for X-Frame-Options header that might block embedding
        const xFrameOptions = response.headers.get('X-Frame-Options');
        if (xFrameOptions && (xFrameOptions.toUpperCase() === 'DENY' || xFrameOptions.toUpperCase() === 'SAMEORIGIN')) {
            return false;
        }

        // Check Content-Security-Policy for frame-ancestors
        const csp = response.headers.get('Content-Security-Policy');
        if (csp && csp.includes('frame-ancestors') && !csp.includes('*')) {
            // If frame-ancestors is specified and doesn't include *, it might block embedding
            return false;
        }

        return true;
    } catch (error) {
        // Network error, timeout, or other issue
        console.error('Error checking LinkedIn embed accessibility:', error);
        return false;
    }
}
