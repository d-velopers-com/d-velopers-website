import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export interface SessionData {
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  roles: string[];
  accessToken: string;
  expiresAt: number;
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
