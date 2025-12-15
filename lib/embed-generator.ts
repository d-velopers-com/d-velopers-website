/**
 * Generates embed iframes from social media URLs
 */

export type SupportedPlatform = 'linkedin' | 'twitter' | 'unknown';

interface EmbedResult {
  success: boolean;
  iframe?: string;
  platform?: SupportedPlatform;
  embeddable?: boolean; // Whether the content can actually be embedded
  error?: string;
}

/**
 * Detects the platform from a URL
 */
export function detectPlatform(url: string): SupportedPlatform {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('linkedin.com')) {
    return 'linkedin';
  }

  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'twitter';
  }

  return 'unknown';
}

/**
 * Extracts LinkedIn post ID from various URL formats
 * Supports:
 * - https://www.linkedin.com/posts/username_activity-ID
 * - https://www.linkedin.com/feed/update/urn:li:activity:ID
 * - https://www.linkedin.com/feed/update/urn:li:share:ID
 */
function extractLinkedInId(url: string): string | null {
  // Format: /posts/username_activity-ID or similar
  const activityMatch = url.match(/activity[:-](\d+)/i);
  if (activityMatch) {
    return activityMatch[1];
  }

  // Format: urn:li:share:ID
  const shareMatch = url.match(/urn:li:share:(\d+)/i);
  if (shareMatch) {
    return shareMatch[1];
  }

  // Format: urn:li:ugcPost:ID
  const ugcMatch = url.match(/urn:li:ugcPost:(\d+)/i);
  if (ugcMatch) {
    return ugcMatch[1];
  }

  return null;
}

/**
 * Generates LinkedIn embed iframe
 * For posts: creates embed iframe
 * For jobs/other: creates placeholder and marks as not embeddable
 */
function generateLinkedInEmbed(url: string): EmbedResult {
  const postId = extractLinkedInId(url);

  if (!postId) {
    // Can't embed this type of LinkedIn content (jobs, profiles, etc.)
    // Create a placeholder iframe that just stores the URL for reference
    // The frontend will use sourceUrl to show the fallback button
    const placeholder = `<iframe src="about:blank" data-linkedin-url="${url}" height="0" width="0" style="display:none;" title="LinkedIn Link"></iframe>`;

    return {
      success: true,
      iframe: placeholder,
      platform: 'linkedin',
      embeddable: false, // Mark as not embeddable
    };
  }

  // LinkedIn embed uses activity URN
  const embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${postId}`;

  const iframe = `<iframe src="${embedUrl}" height="600" width="504" frameborder="0" allowfullscreen="" title="LinkedIn Post"></iframe>`;

  return {
    success: true,
    iframe,
    platform: 'linkedin',
    embeddable: true,
  };
}

/**
 * Extracts Twitter/X tweet ID from URL
 * Supports:
 * - https://twitter.com/username/status/ID
 * - https://x.com/username/status/ID
 */
function extractTwitterId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Generates Twitter/X embed iframe
 */
function generateTwitterEmbed(url: string): EmbedResult {
  const tweetId = extractTwitterId(url);

  if (!tweetId) {
    return {
      success: false,
      error: 'Could not extract Tweet ID from URL',
    };
  }

  // Twitter embed URL format
  const embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;

  const iframe = `<iframe src="${embedUrl}" height="500" width="550" frameborder="0" allowfullscreen="" title="Twitter Post"></iframe>`;

  return {
    success: true,
    iframe,
    platform: 'twitter',
  };
}

/**
 * Checks if input is a URL
 */
export function isUrl(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Checks if input is an iframe
 */
export function isIframe(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  return trimmed.startsWith('<iframe') && trimmed.endsWith('</iframe>');
}

/**
 * Main function: generates embed from URL or validates iframe
 */
export function generateEmbed(input: string): EmbedResult {
  const trimmed = input.trim();

  // If it's already an iframe, return as-is
  if (isIframe(trimmed)) {
    return {
      success: true,
      iframe: trimmed,
      platform: 'unknown',
    };
  }

  // If it's not a URL, return error
  if (!isUrl(trimmed)) {
    return {
      success: false,
      error: 'Input must be a URL or iframe code',
    };
  }

  // Detect platform and generate embed
  const platform = detectPlatform(trimmed);

  switch (platform) {
    case 'linkedin':
      return generateLinkedInEmbed(trimmed);
    case 'twitter':
      return generateTwitterEmbed(trimmed);
    default:
      // For any other URL, generate a generic iframe
      // Mark as embeddable by default - frontend can verify later
      return {
        success: true,
        iframe: `<iframe src="${trimmed}" width="100%" height="500" frameborder="0" allowfullscreen="" title="External Content"></iframe>`,
        platform: 'unknown',
        embeddable: true,
      };
  }
}

/**
 * Get supported platforms info
 */
export function getSupportedPlatforms(): { name: string; examples: string[] }[] {
  return [
    {
      name: 'LinkedIn',
      examples: [
        'https://www.linkedin.com/posts/username_activity-123456789',
        'https://www.linkedin.com/feed/update/urn:li:activity:123456789',
      ],
    },
    {
      name: 'Twitter/X',
      examples: [
        'https://twitter.com/username/status/123456789',
        'https://x.com/username/status/123456789',
      ],
    },
  ];
}

