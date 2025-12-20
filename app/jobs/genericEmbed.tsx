import {memo, useCallback, useEffect, useMemo, useState} from "react";
import {Skeleton} from "@heroui/skeleton";

export const GenericEmbed = memo(function GenericEmbed(
  {
    iframeHtml,
    sourceUrl,
    embeddable,
    translations
  }: {
    iframeHtml: string;
    sourceUrl: string;
    embeddable: boolean;
    translations: {
      cannotBeEmbedded: string;
      openInSite: string;
    };
  }) {
  const [ogData, setOgData] = useState<OGMetadata | null>(null);
  const [isLoadingOG, setIsLoadingOG] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  // Extract src from iframe HTML
  const iframeSrc = useMemo(() => {
    const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : null;
  }, [iframeHtml]);

  // Check if URL is known to be non-embeddable
  const isKnownNonEmbeddable = useMemo(() => {
    if (!sourceUrl) return false;
    const url = sourceUrl.toLowerCase();
    // Add known non-embeddable domains
    const nonEmbeddableDomains = [
      'ashbyhq.com',
      'greenhouse.io',
      'lever.co',
      'workday.com',
      'myworkdayjobs.com',
    ];
    return nonEmbeddableDomains.some(domain => url.includes(domain));
  }, [sourceUrl]);

  // Handlers for iframe load events
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

  // Fetch OG data when not embeddable
  useEffect(() => {
    if ((!embeddable || isKnownNonEmbeddable || iframeError) && sourceUrl && !ogData) {
      setIsLoadingOG(true);
      fetch(`/api/og-metadata?url=${encodeURIComponent(sourceUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setOgData(data);
          }
        })
        .catch(() => {
        })
        .finally(() => setIsLoadingOG(false));
    }
  }, [embeddable, sourceUrl, isKnownNonEmbeddable, iframeError]);

  if (!embeddable || iframeError || isKnownNonEmbeddable) {
    return (
      <div className="w-full px-5 py-6">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-default-200 hover:border-primary transition-colors bg-default-50 hover:bg-default-100"
        >
          {/* OG Image */}
          {isLoadingOG ? (
            <Skeleton className="w-full h-48"/>
          ) : ogData?.image ? (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={ogData.image}
                alt={ogData.title || "Preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div
              className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {isLoadingOG ? (
              <>
                <Skeleton className="h-5 w-3/4 mb-2 rounded"/>
                <Skeleton className="h-4 w-full rounded"/>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-foreground line-clamp-2 mb-1">
                  {ogData?.title || sourceUrl}
                </h4>
                {ogData?.description && (
                  <p className="text-sm text-default-500 line-clamp-2">
                    {ogData.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-default-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  <span>{ogData?.siteName || new URL(sourceUrl).hostname}</span>
                </div>
              </>
            )}
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center relative">
      {isLoadingIframe && (
        <div className="absolute inset-0 flex items-center justify-center bg-default-50" style={{minHeight: '500px'}}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        </div>
      )}
      <iframe
        src={iframeSrc || ''}
        width="100%"
        height="500"
        frameBorder="0"
        allowFullScreen
        title="External Content"
        className="max-w-full"
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
    </div>
  );
});

interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
}
