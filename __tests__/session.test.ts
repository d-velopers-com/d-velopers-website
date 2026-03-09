import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookieStore,
  cookiesMock,
  jwtVerifyMock,
  refreshDiscordTokenMock,
  signPayloads,
} = vi.hoisted(() => {
  const cookieStore = {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  };

  return {
    cookieStore,
    cookiesMock: vi.fn(async () => cookieStore),
    jwtVerifyMock: vi.fn(),
    refreshDiscordTokenMock: vi.fn(),
    signPayloads: [] as unknown[],
  };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("jose", () => ({
  SignJWT: class MockSignJWT {
    constructor(payload: unknown) {
      signPayloads.push(payload);
    }

    setProtectedHeader() {
      return this;
    }

    setIssuedAt() {
      return this;
    }

    setExpirationTime() {
      return this;
    }

    async sign() {
      return "signed-session-token";
    }
  },
  jwtVerify: jwtVerifyMock,
}));

vi.mock("@/lib/discord-oauth", () => ({
  refreshDiscordToken: refreshDiscordTokenMock,
}));

describe("session resolution", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXTAUTH_SECRET = "test-secret";
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
    cookiesMock.mockClear();
    jwtVerifyMock.mockReset();
    refreshDiscordTokenMock.mockReset();
    signPayloads.length = 0;
  });

  it("keeps a valid local session without forcing Discord refresh", async () => {
    const expiresAt = Date.now() + 60 * 60 * 1000;

    cookieStore.get.mockReturnValue({ value: "valid-token" });
    jwtVerifyMock.mockResolvedValue({
      payload: {
        discordId: "123",
        username: "diego",
        discriminator: "0001",
        roles: ["role-a"],
        expiresAt,
      },
    });

    const { resolveSession } = await import("@/lib/session");
    const result = await resolveSession();

    expect(result).toEqual({
      discordReauthRequired: false,
      session: {
        discordId: "123",
        username: "diego",
        discriminator: "0001",
        roles: ["role-a"],
        expiresAt,
      },
    });
    expect(refreshDiscordTokenMock).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("refreshes the Discord token when the OAuth token expired but refresh token is valid", async () => {
    const expiredSession = {
      discordId: "123",
      username: "diego",
      discriminator: "0001",
      roles: ["role-a"],
      accessToken: "old-access",
      refreshToken: "refresh-token",
      expiresAt: Date.now() - 1000,
    };

    cookieStore.get.mockReturnValue({ value: "expired-token" });
    jwtVerifyMock.mockResolvedValue({ payload: expiredSession });
    refreshDiscordTokenMock.mockResolvedValue({
      access_token: "new-access",
      refresh_token: "new-refresh",
      expires_in: 7200,
      scope: "identify",
      token_type: "Bearer",
    });

    const { resolveSession } = await import("@/lib/session");
    const result = await resolveSession();

    expect(result.discordReauthRequired).toBe(false);
    expect(result.session).toMatchObject({
      discordId: "123",
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(refreshDiscordTokenMock).toHaveBeenCalledWith("refresh-token");
    expect(cookieStore.set).toHaveBeenCalledWith(
      "session",
      "signed-session-token",
      expect.objectContaining({
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
      }),
    );
    expect(signPayloads).toContainEqual(
      expect.objectContaining({
        discordId: "123",
        accessToken: "new-access",
        refreshToken: "new-refresh",
      }),
    );
  });

  it("keeps the app session but marks Discord reauth as required when refresh fails", async () => {
    const expiredSession = {
      discordId: "123",
      username: "diego",
      discriminator: "0001",
      roles: ["role-a"],
      accessToken: "old-access",
      refreshToken: "refresh-token",
      expiresAt: Date.now() - 1000,
    };

    cookieStore.get.mockReturnValue({ value: "expired-token" });
    jwtVerifyMock.mockResolvedValue({ payload: expiredSession });
    refreshDiscordTokenMock.mockRejectedValue(new Error("refresh failed"));

    const { resolveSession } = await import("@/lib/session");
    const result = await resolveSession();

    expect(result).toEqual({
      discordReauthRequired: true,
      session: expiredSession,
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("marks Discord reauth as required when the session has no refresh token left", async () => {
    const expiredSession = {
      discordId: "123",
      username: "diego",
      discriminator: "0001",
      roles: ["role-a"],
      accessToken: "old-access",
      expiresAt: Date.now() - 1000,
    };

    cookieStore.get.mockReturnValue({ value: "expired-token" });
    jwtVerifyMock.mockResolvedValue({ payload: expiredSession });

    const { resolveSession } = await import("@/lib/session");
    const result = await resolveSession();

    expect(result).toEqual({
      discordReauthRequired: true,
      session: expiredSession,
    });
    expect(refreshDiscordTokenMock).not.toHaveBeenCalled();
  });
});
