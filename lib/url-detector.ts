export type SocialPlatform =
  | "linkedin"
  | "github"
  | "twitter"
  | "x"
  | "youtube"
  | "instagram"
  | "discord"
  | "other";

export function detectSocialPlatform(url: string): SocialPlatform {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // LinkedIn
    if (hostname.includes("linkedin.com")) {
      return "linkedin";
    }

    // GitHub
    if (hostname.includes("github.com")) {
      return "github";
    }

    // Twitter/X
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return "x";
    }

    // YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube";
    }

    // Instagram
    if (hostname.includes("instagram.com")) {
      return "instagram";
    }

    // Discord
    if (hostname.includes("discord.com") || hostname.includes("discord.gg")) {
      return "discord";
    }

    return "other";
  } catch {
    return "other";
  }
}

