export type DebouncedFunction<T extends (...args: never[]) => unknown> = ((
  ...args: Parameters<T>
) => void) & { cancel: () => void };

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const executedFunction = (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  executedFunction.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  };

  return executedFunction;
}

export function filtersToSearchParams(
  filters: Record<string, any>,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (!Array.isArray(value)) {
        params.set(key, String(value));
      }
    }
  });
  return params;
}

export const validateRecentActivation = (
  profileActivatedAt: string | null | undefined,
) => {
  if (!profileActivatedAt) {
    return false;
  }
  return (
    new Date(profileActivatedAt).getTime() >
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );
};
