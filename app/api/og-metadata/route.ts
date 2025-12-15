import { NextRequest, NextResponse } from "next/server";

interface OGMetadata {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
}

/**
 * Fetches Open Graph metadata from a URL
 * GET /api/og-metadata?url=https://example.com
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json(
            { error: "URL parameter is required" },
            { status: 400 }
        );
    }

    try {
        // Validate URL format
        new URL(url);
    } catch {
        return NextResponse.json(
            { error: "Invalid URL format" },
            { status: 400 }
        );
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; OGFetcher/1.0; +http://example.com/bot)',
                'Accept': 'text/html,application/xhtml+xml',
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch URL", status: response.status },
                { status: 502 }
            );
        }

        const html = await response.text();
        const metadata = parseOGMetadata(html, url);

        return NextResponse.json(metadata);
    } catch (error) {
        console.error("Error fetching OG metadata:", error);
        return NextResponse.json(
            { error: "Failed to fetch metadata", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

/**
 * Parse OG metadata from HTML
 */
function parseOGMetadata(html: string, originalUrl: string): OGMetadata {
    const metadata: OGMetadata = {
        url: originalUrl,
    };

    // Helper to extract meta content
    const getMetaContent = (property: string): string | undefined => {
        // Try og: prefix
        const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
        if (ogMatch) return ogMatch[1];

        // Try reverse order (content before property)
        const ogMatchReverse = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'));
        if (ogMatchReverse) return ogMatchReverse[1];

        // Try twitter: prefix
        const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i'));
        if (twitterMatch) return twitterMatch[1];

        // Try reverse for twitter
        const twitterMatchReverse = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, 'i'));
        if (twitterMatchReverse) return twitterMatchReverse[1];

        return undefined;
    };

    // Extract metadata
    metadata.title = getMetaContent('title');
    metadata.description = getMetaContent('description');
    metadata.image = getMetaContent('image');
    metadata.siteName = getMetaContent('site_name');

    // Fallback: get title from <title> tag if no OG title
    if (!metadata.title) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            metadata.title = titleMatch[1].trim();
        }
    }

    // Fallback: get description from meta description
    if (!metadata.description) {
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (descMatch) {
            metadata.description = descMatch[1];
        }
    }

    // Make image URL absolute if relative
    if (metadata.image && !metadata.image.startsWith('http')) {
        try {
            const baseUrl = new URL(originalUrl);
            metadata.image = new URL(metadata.image, baseUrl.origin).href;
        } catch {
            // Keep as-is if URL parsing fails
        }
    }

    return metadata;
}
