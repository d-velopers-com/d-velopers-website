export function isValidHtmlString(htmlString: string): boolean {
  const MAX_LENGTH = 2000; // Increased to support generated iframes
  if (htmlString.length > MAX_LENGTH) {
    return false;
  }
  const trimmed = htmlString.trim();
  if (!trimmed) {
    return false;
  }
  const lowerCased = trimmed.toLowerCase();
  if (!lowerCased.startsWith("<iframe")) {
    return false;
  }
  if (!lowerCased.endsWith("</iframe>")) {
    return false;
  }
  if (trimmed.includes("/>")) {
    return false;
  }
  const openCount = countOccurrences(lowerCased, "<iframe");
  const closeCount = countOccurrences(lowerCased, "</iframe>");
  if (openCount !== 1 || closeCount !== 1) {
    return false;
  }
  const forbiddenTags = [
    "<div",
    "<span",
    "<script",
    "<style",
    "<img",
    "<a",
    "<p",
    "<h1",
    "<h2",
    "<h3",
    "<button",
    "<input",
    "<form",
    "<table",
  ];
  for (const tag of forbiddenTags) {
    if (lowerCased.includes(tag)) {
      return false;
    }
  }

  const srcMatch = trimmed.match(/\bsrc\s*=\s*["']([^"']+)["']/i);

  if (!srcMatch || !isSafeExternalUrl(srcMatch[1])) {
    return false;
  }

  const forbiddenAttributePattern =
    /\s(?:on[a-z]+|srcdoc|style)\s*=|\b(?:javascript|data|file):/i;

  return !forbiddenAttributePattern.test(trimmed);
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function countOccurrences(str: string, substring: string): number {
  let count = 0;
  let position = 0;
  while ((position = str.indexOf(substring, position)) !== -1) {
    count++;
    position += substring.length;
  }
  return count;
}
