import { describe, expect, it } from "vitest";

import {
  DEFAULT_COVER_IMAGE_FIT,
  DEFAULT_COVER_IMAGE_POSITION,
  DEFAULT_COVER_IMAGE_ZOOM,
  MAX_COVER_IMAGE_ZOOM,
  MIN_COVER_FIT_ZOOM,
  MIN_COVER_IMAGE_ZOOM,
  normalizeCoverImageFit,
  normalizeCoverImagePosition,
  normalizeCoverImageZoom,
} from "@/lib/project-cover";

describe("project cover framing helpers", () => {
  it("normalizes cover image fit values", () => {
    expect(normalizeCoverImageFit("contain")).toBe("contain");
    expect(normalizeCoverImageFit("cover")).toBe("cover");
    expect(normalizeCoverImageFit("invalid")).toBe(DEFAULT_COVER_IMAGE_FIT);
    expect(normalizeCoverImageFit(null)).toBe(DEFAULT_COVER_IMAGE_FIT);
  });

  it("clamps and rounds cover image positions", () => {
    expect(normalizeCoverImagePosition(25.6)).toBe(26);
    expect(normalizeCoverImagePosition(-10)).toBe(0);
    expect(normalizeCoverImagePosition(150)).toBe(100);
    expect(normalizeCoverImagePosition(Number.NaN)).toBe(
      DEFAULT_COVER_IMAGE_POSITION,
    );
    expect(normalizeCoverImagePosition(undefined)).toBe(
      DEFAULT_COVER_IMAGE_POSITION,
    );
  });

  it("clamps cover image zoom according to fit mode", () => {
    expect(normalizeCoverImageZoom(0.7, "contain")).toBe(0.7);
    expect(normalizeCoverImageZoom(0.1, "contain")).toBe(MIN_COVER_IMAGE_ZOOM);
    expect(normalizeCoverImageZoom(0.7, "cover")).toBe(MIN_COVER_FIT_ZOOM);
    expect(normalizeCoverImageZoom(3.5, "cover")).toBe(MAX_COVER_IMAGE_ZOOM);
    expect(normalizeCoverImageZoom(1.234, "cover")).toBe(1.23);
    expect(normalizeCoverImageZoom(null, "cover")).toBe(
      DEFAULT_COVER_IMAGE_ZOOM,
    );
  });
});
