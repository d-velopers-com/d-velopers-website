import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { LinkPreviewCard } from "@/components/LinkPreviewCard";

export const GenericEmbed = memo(function GenericEmbed({
  iframeHtml,
  sourceUrl,
  embeddable,
  translations,
}: {
  iframeHtml: string;
  sourceUrl: string;
  embeddable: boolean;
  translations: {
    cannotBeEmbedded: string;
    openInSite: string;
    externalContent: string;
  };
}) {
  const [iframeError, setIframeError] = useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  // Treat stored iframe markup as untrusted data and only read its URL.
  const iframeSrc = useMemo(() => {
    const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);

    if (!srcMatch) return null;

    try {
      const url = new URL(srcMatch[1]);

      return url.protocol === "https:" || url.protocol === "http:"
        ? url.href
        : null;
    } catch {
      return null;
    }
  }, [iframeHtml]);

  // Check if URL is known to be non-embeddable
  const isKnownNonEmbeddable = useMemo(() => {
    if (!sourceUrl) return false;
    const url = sourceUrl.toLowerCase();
    const nonEmbeddableDomains = [
      "ashbyhq.com",
      "greenhouse.io",
      "lever.co",
      "workday.com",
      "myworkdayjobs.com",
    ];
    return nonEmbeddableDomains.some((domain) => url.includes(domain));
  }, [sourceUrl]);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
    setIsLoadingIframe(false);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoadingIframe(false);
  }, []);

  useEffect(() => {
    if (!embeddable || isKnownNonEmbeddable || !iframeSrc) {
      setIsLoadingIframe(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (isLoadingIframe) {
        setIframeError(true);
        setIsLoadingIframe(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [iframeSrc, isLoadingIframe, embeddable, isKnownNonEmbeddable]);

  // Fallback to LinkPreviewCard when not embeddable or iframe fails
  if (!embeddable || iframeError || isKnownNonEmbeddable) {
    return (
      <LinkPreviewCard
        sourceUrl={sourceUrl}
        translations={{ externalContent: translations.externalContent }}
      />
    );
  }

  return (
    <div className="w-full flex justify-center relative">
      {isLoadingIframe && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-default-50"
          style={{ minHeight: "500px" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      <iframe
        allowFullScreen
        className="max-w-full"
        height="500"
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
        src={iframeSrc || ""}
        title={translations.externalContent}
        width="100%"
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
    </div>
  );
});
