import type { OGMetadata } from "@/types/og-metadata";

import { promises as dns } from "node:dns";

import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";
import { Agent, fetch as pinnedFetch } from "undici";

import { isPrivateIp } from "@/lib/network-security";
import { parseOGMetadata } from "@/lib/og-metadata";

const MAX_RESPONSE_BYTES = 1_000_000;
const cache = new LRUCache<string, OGMetadata>({
  max: 200,
  ttl: 60 * 60 * 1000,
});

async function assertSafeRemoteUrl(value: string) {
  const url = new URL(value);

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password ||
    (url.port && url.port !== "80" && url.port !== "443")
  ) {
    throw new Error("Unsupported URL");
  }

  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new Error("Private hosts are not allowed");
  }

  const addresses = await dns.lookup(url.hostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateIp(address))
  ) {
    throw new Error("Private hosts are not allowed");
  }

  return { address: addresses[0].address, family: addresses[0].family, url };
}

async function readLimitedText(
  response: Awaited<ReturnType<typeof pinnedFetch>>,
) {
  const contentLength = Number(response.headers.get("content-length") || 0);

  if (contentLength > MAX_RESPONSE_BYTES) {
    throw new Error("Response is too large");
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    received += value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Response is too large");
    }

    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
}

export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("url");

  if (!value) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  let safeTarget: Awaited<ReturnType<typeof assertSafeRemoteUrl>>;

  try {
    safeTarget = await assertSafeRemoteUrl(value);
  } catch {
    return NextResponse.json({ error: "URL is not allowed" }, { status: 400 });
  }

  const cached = cache.get(safeTarget.url.href);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const dispatcher = new Agent({
    connect: {
      lookup: (_hostname, _options, callback) => {
        if (_options?.all) {
          callback(null, [
            { address: safeTarget.address, family: safeTarget.family },
          ]);
          return;
        }

        callback(null, safeTarget.address, safeTarget.family);
      },
    },
  });

  try {
    const response = await pinnedFetch(safeTarget.url, {
      dispatcher,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "D-velopers-LinkPreview/1.0",
      },
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.toLowerCase().includes("text/html")) {
      return NextResponse.json(
        { error: "Failed to fetch HTML" },
        { status: 502 },
      );
    }

    const metadata = parseOGMetadata(
      await readLimitedText(response),
      safeTarget.url.href,
    );

    cache.set(safeTarget.url.href, metadata);

    return NextResponse.json(metadata, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 502 },
    );
  } finally {
    await dispatcher.close();
  }
}
