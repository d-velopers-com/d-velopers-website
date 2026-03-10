import https from "node:https";

import { NextRequest, NextResponse } from "next/server";

import { getDiscordAvatarUrl } from "@/shared/lib";

function getFirstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeAvatarSize(value: string | null) {
  const parsed = Number.parseInt(value || "96", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 96;
  }

  return Math.min(Math.max(parsed, 32), 256);
}

function buildFallbackSvg(size: number) {
  const radius = size / 2;
  const fontSize = Math.round(size * 0.4);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Avatar">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#27272a" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#fafafa">?</text>
    </svg>
  `.trim();
}

function concatUint8Arrays(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return Buffer.from(merged);
}

function fetchImageBuffer(url: string) {
  return new Promise<{
    body: Buffer;
    contentType?: string;
    cacheControl?: string;
  }>((resolve, reject) => {
    const request = https.get(
      url,
      {
        family: 4,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      },
      (response) => {
        if (!response.statusCode || response.statusCode >= 400) {
          response.resume();
          reject(new Error(`Upstream responded with ${response.statusCode}`));
          return;
        }

        const chunks: Uint8Array[] = [];

        response.on("data", (chunk) => {
          chunks.push(
            new Uint8Array(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
          );
        });
        response.on("end", () => {
          resolve({
            body: concatUint8Arrays(chunks),
            contentType: getFirstHeaderValue(response.headers["content-type"]),
            cacheControl: getFirstHeaderValue(response.headers["cache-control"]),
          });
        });
      },
    );

    request.on("error", reject);
  });
}

export async function GET(request: NextRequest) {
  const discordId = request.nextUrl.searchParams.get("discordId");
  const discriminator = request.nextUrl.searchParams.get("discriminator");
  const avatar = request.nextUrl.searchParams.get("avatar");
  const size = normalizeAvatarSize(request.nextUrl.searchParams.get("size"));

  if (!discordId || !discriminator) {
    return NextResponse.json(
      { error: "discordId and discriminator are required" },
      { status: 400 },
    );
  }

  const avatarUrl = getDiscordAvatarUrl(
    discordId,
    avatar && avatar.length > 0 ? avatar : null,
    discriminator,
    size,
  );

  try {
    const image = await fetchImageBuffer(avatarUrl);

    return new NextResponse(image.body, {
      headers: {
        "Cache-Control":
          image.cacheControl || "public, max-age=31536000, immutable",
        "Content-Type": image.contentType || "image/png",
      },
    });
  } catch {
    return new NextResponse(buildFallbackSvg(size), {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": "image/svg+xml",
      },
    });
  }
}
