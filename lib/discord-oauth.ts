interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string | null;
}

interface DiscordGuildMember {
  user?: DiscordUser;
  roles: string[];
  joined_at: string;
  nick?: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  console.log("[DISCORD OAUTH] Exchanging code for token");
  console.log("[DISCORD OAUTH] Redirect URI:", redirectUri);
  console.log("[DISCORD OAUTH] Client ID:", process.env.DISCORD_CLIENT_ID ? "✓ Set" : "✗ Missing");
  console.log("[DISCORD OAUTH] Client Secret:", process.env.DISCORD_CLIENT_SECRET ? "✓ Set" : "✗ Missing");

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Could not read error");
    console.error("[DISCORD OAUTH] ✗ Token exchange failed");
    console.error("[DISCORD OAUTH] Status:", response.status, response.statusText);
    console.error("[DISCORD OAUTH] Error response:", errorText);
    throw new Error(`Failed to exchange code for token: ${response.status} - ${errorText}`);
  }

  console.log("[DISCORD OAUTH] ✓ Token exchange successful");
  return response.json();
}

export async function getDiscordUser(
  accessToken: string,
): Promise<DiscordUser> {
  console.log("[DISCORD OAUTH] Fetching Discord user");
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Could not read error");
    console.error("[DISCORD OAUTH] ✗ Failed to fetch user");
    console.error("[DISCORD OAUTH] Status:", response.status, response.statusText);
    console.error("[DISCORD OAUTH] Error response:", errorText);
    throw new Error(`Failed to fetch Discord user: ${response.status} - ${errorText}`);
  }

  console.log("[DISCORD OAUTH] ✓ User fetched successfully");
  return response.json();
}

export async function getGuildMember(
  accessToken: string,
  guildId: string,
): Promise<{ roles: string[]; isMember: boolean; joinedAt?: string }> {
  console.log("[DISCORD OAUTH] Fetching guild member, Guild ID:", guildId);
  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 404) {
    console.log("[DISCORD OAUTH] User is not a member of the guild");
    return { roles: [], isMember: false };
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Could not read error");
    console.error("[DISCORD OAUTH] ✗ Failed to fetch guild member");
    console.error("[DISCORD OAUTH] Status:", response.status, response.statusText);
    console.error("[DISCORD OAUTH] Error response:", errorText);
    throw new Error(`Failed to fetch guild member: ${response.status} - ${errorText}`);
  }

  console.log("[DISCORD OAUTH] ✓ Guild member data fetched");
  const member: DiscordGuildMember = await response.json();

  return { roles: member.roles, isMember: true, joinedAt: member.joined_at };
}
