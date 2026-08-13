import { describe, expect, it } from "vitest";

import { isSafeExternalUrl, isValidHtmlString } from "@/lib/validations";

describe("embed validation", () => {
  it("accepts a single HTTPS iframe", () => {
    expect(
      isValidHtmlString(
        '<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:1"></iframe>',
      ),
    ).toBe(true);
  });

  it("accepts the inert LinkedIn fallback shape", () => {
    expect(
      isValidHtmlString(
        '<iframe src="https://www.linkedin.com/jobs/view/123" data-linkedin-url="https://www.linkedin.com/jobs/view/123" height="0" width="0" title="LinkedIn Link"></iframe>',
      ),
    ).toBe(true);
  });

  it.each([
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe src="https://example.com" onload="alert(1)"></iframe>',
    '<iframe src="https://example.com" srcdoc="<script>alert(1)</script>"></iframe>',
    '<iframe src="data:text/html,unsafe"></iframe>',
    '<iframe src="https://example.com"></iframe><script>alert(1)</script>',
  ])("rejects unsafe iframe markup: %s", (markup) => {
    expect(isValidHtmlString(markup)).toBe(false);
  });
});

describe("external URL validation", () => {
  it.each(["https://example.com", "http://example.com/path"])(
    "accepts %s",
    (url) => expect(isSafeExternalUrl(url)).toBe(true),
  );

  it.each(["javascript:alert(1)", "data:text/html,test", "file:///tmp/a"])(
    "rejects %s",
    (url) => expect(isSafeExternalUrl(url)).toBe(false),
  );
});
