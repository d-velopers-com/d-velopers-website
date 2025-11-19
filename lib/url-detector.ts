export type SocialPlatform =
  | "linkedin"
  | "github"
  | "twitter"
  | "x"
  | "youtube"
  | "instagram"
  | "discord"
  | "facebook"
  | "tiktok"
  | "twitch"
  | "reddit"
  | "telegram"
  | "whatsapp"
  | "spotify"
  | "medium"
  | "behance"
  | "dribbble"
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

    // Facebook
    if (hostname.includes("facebook.com") || hostname.includes("fb.com")) {
      return "facebook";
    }

    // TikTok
    if (hostname.includes("tiktok.com")) {
      return "tiktok";
    }

    // Twitch
    if (hostname.includes("twitch.tv")) {
      return "twitch";
    }

    // Reddit
    if (hostname.includes("reddit.com")) {
      return "reddit";
    }

    // Telegram
    if (hostname.includes("t.me") || hostname.includes("telegram.org")) {
      return "telegram";
    }

    // WhatsApp
    if (hostname.includes("wa.me") || hostname.includes("whatsapp.com")) {
      return "whatsapp";
    }

    // Spotify
    if (
      hostname.includes("spotify.com") ||
      hostname.includes("open.spotify.com")
    ) {
      return "spotify";
    }

    // Medium
    if (hostname.includes("medium.com")) {
      return "medium";
    }

    // Behance
    if (hostname.includes("behance.net")) {
      return "behance";
    }

    // Dribbble
    if (hostname.includes("dribbble.com")) {
      return "dribbble";
    }

    return "other";
  } catch {
    return "other";
  }
}
