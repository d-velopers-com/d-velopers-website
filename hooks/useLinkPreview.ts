import type { OGMetadata } from "@/types/og-metadata";

import { useEffect, useState } from "react";

export function useLinkPreview(sourceUrl: string | null) {
  const [ogData, setOgData] = useState<OGMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceUrl) return;

    setIsLoading(true);
    setError(null);

    fetch(`/api/og-metadata?url=${encodeURIComponent(sourceUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOgData(data);
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to fetch preview",
        );
      })
      .finally(() => setIsLoading(false));
  }, [sourceUrl]);

  return { ogData, isLoading, error };
}
