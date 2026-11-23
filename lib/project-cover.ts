export type ProjectCoverFit = "cover" | "contain";

export const DEFAULT_COVER_IMAGE_FIT: ProjectCoverFit = "cover";
export const DEFAULT_COVER_IMAGE_POSITION = 50;
export const DEFAULT_COVER_IMAGE_ZOOM = 1;
export const MIN_COVER_IMAGE_ZOOM = 0.5;
export const MAX_COVER_IMAGE_ZOOM = 2.5;
export const MIN_COVER_FIT_ZOOM = 1;

export function normalizeCoverImageFit(value: unknown): ProjectCoverFit {
  return value === "contain" ? "contain" : DEFAULT_COVER_IMAGE_FIT;
}

export function normalizeCoverImagePosition(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_COVER_IMAGE_POSITION;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeCoverImageZoom(
  value: unknown,
  fit: ProjectCoverFit = DEFAULT_COVER_IMAGE_FIT,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_COVER_IMAGE_ZOOM;
  }

  const minZoom = fit === "contain" ? MIN_COVER_IMAGE_ZOOM : MIN_COVER_FIT_ZOOM;
  const clamped = Math.max(minZoom, Math.min(MAX_COVER_IMAGE_ZOOM, value));

  return Math.round(clamped * 100) / 100;
}
