import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { refreshDiscordToken } from "@/lib/discord-oauth";

export interface SessionData {
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  roles: string[];
  accessToken?: string;
  refreshToken?: string | null;
  expiresAt?: number;
}

export interface SessionResolution {
  session: SessionData | null;
  discordReauthRequired: boolean;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET as string,
);

export async function createSession(data: SessionData): Promise<void> {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);

    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete("session");
}

export function isDiscordTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) {
    return true;
  }

  // Add 5 minute buffer to avoid edge cases
  const bufferMs = 5 * 60 * 1000;
  return Date.now() >= (expiresAt - bufferMs);
}

export async function refreshDiscordSession(
  session: SessionData,
): Promise<SessionData | null> {
  if (!session.refreshToken) {
    return null;
  }

  try {
    const tokenData = await refreshDiscordToken(session.refreshToken);
    const refreshedSession: SessionData = {
      ...session,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || session.refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    await createSession(refreshedSession);

    return refreshedSession;
  } catch {
    return null;
  }
}

export async function resolveSession(): Promise<SessionResolution> {
  const session = await getSession();

  if (!session) {
    return { session: null, discordReauthRequired: false };
  }

  if (!isDiscordTokenExpired(session.expiresAt)) {
    return { session, discordReauthRequired: false };
  }

  const refreshedSession = await refreshDiscordSession(session);

  if (refreshedSession) {
    return { session: refreshedSession, discordReauthRequired: false };
  }

  return { session, discordReauthRequired: true };
}
