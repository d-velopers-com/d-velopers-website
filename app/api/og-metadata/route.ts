import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import type { OGMetadata } from "@/types/og-metadata";
import { parseOGMetadata } from "@/lib/og-metadata";

const cache = new LRUCache<string, OGMetadata>({
    max: 200,
    ttl: 60 * 60 * 1000, // 1 hour
});

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

    // Check cache
    const cached = cache.get(url);
    if (cached) {
        return NextResponse.json(cached, {
            headers: {
                "Cache-Control": "s-maxage=3600, stale-while-revalidate",
            },
        });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Use Googlebot UA for LinkedIn to avoid blocked responses
        const isLinkedIn = url.includes("linkedin.com");
        const userAgent = isLinkedIn
            ? "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
            : "Mozilla/5.0 (compatible; OGFetcher/1.0; +http://example.com/bot)";
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': userAgent,
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

        cache.set(url, metadata);

        return NextResponse.json(metadata, {
            headers: {
                "Cache-Control": "s-maxage=3600, stale-while-revalidate",
            },
        });
    } catch (error) {
        console.error("Error fetching OG metadata:", error);
        return NextResponse.json(
            { error: "Failed to fetch metadata", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
