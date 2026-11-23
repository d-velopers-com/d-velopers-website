"use client";

import type { ProductListItem, ProductsPage } from "@/lib/products";

import { useCallback, useEffect, useRef, useState } from "react";

import ProjectShowcaseCard from "@/components/project-showcase-card";
import { useLanguage } from "@/contexts/language-context";

interface ProductsClientProps {
  initialProducts: ProductListItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

function ProductCard({ product }: { product: ProductListItem }) {
  const { t } = useLanguage();

  return (
    <ProjectShowcaseCard
      creator={product.creator}
      labels={{
        openProject: t.products.openProduct,
        createdBy: t.products.createdBy,
        communityMember: t.products.communityMember,
        noDescription: t.products.noDescription,
        untitledProject: t.dashboard.projectPreviewUntitled,
        domainPlaceholder: t.dashboard.projectPreviewDomain,
      }}
      project={product}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="motion-safe:animate-pulse flex h-full flex-col overflow-hidden rounded-2xl border border-default-200/60 bg-content1"
    >
      <div className="aspect-[16/7] w-full bg-default-100" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="h-6 w-4/5 rounded bg-default-100" />
        <div className="mt-2 h-3 w-1/3 rounded bg-default-100" />
        <div className="mt-4 h-3 w-full rounded bg-default-100" />
        <div className="mt-2 h-3 w-11/12 rounded bg-default-100" />
        <div className="mt-auto flex items-center gap-3 border-t border-default-200/60 pt-4">
          <div className="h-12 w-12 rounded-full bg-default-100" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-default-100" />
            <div className="h-3 w-20 rounded bg-default-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient({
  initialProducts,
  initialCursor,
  initialHasMore,
}: ProductsClientProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isRequestPending = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore || isRequestPending.current) {
      return;
    }

    isRequestPending.current = true;
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch(
        `/api/products?cursor=${encodeURIComponent(cursor)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Could not load the next products page");
      }

      const nextPage = (await response.json()) as ProductsPage;
      setProducts((currentProducts) => {
        const knownIds = new Set(currentProducts.map((product) => product.id));
        return [
          ...currentProducts,
          ...nextPage.products.filter((product) => !knownIds.has(product.id)),
        ];
      });
      setCursor(nextPage.nextCursor);
      setHasMore(nextPage.hasMore);
    } catch {
      setHasError(true);
    } finally {
      isRequestPending.current = false;
      setIsLoading(false);
    }
  }, [cursor, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading || hasError) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "640px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasError, hasMore, isLoading, loadMore]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t.products.title}
        </h1>
        <p className="mt-2 text-base text-default-500 sm:text-lg">
          {t.products.description}
        </p>
      </header>

      <section aria-labelledby="products-heading" className="mt-8 sm:mt-10">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-default-200/60 pb-4 sm:mb-7">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {t.products.latestEyebrow}
            </p>
            <h2
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              id="products-heading"
            >
              {t.products.latestHeading}
            </h2>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <ProductCardSkeleton key={`skeleton-${index}`} />
                ))
              : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-default-200 bg-content1/60 px-6 py-14 text-center sm:py-20">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4.75 7.25 12 3.5l7.25 3.75v9.5L12 20.5l-7.25-3.75v-9.5Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <h2 className="mt-5 text-xl font-semibold text-foreground">
              {t.products.emptyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-default-600">
              {t.products.emptyDescription}
            </p>
          </div>
        )}

        {hasError ? (
          <div className="mt-8 text-center" role="alert">
            <p className="text-sm text-danger">{t.products.loadError}</p>
            <button
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-default-200/70 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => void loadMore()}
              type="button"
            >
              {t.products.retry}
            </button>
          </div>
        ) : null}

        {hasMore ? (
          <div className="flex flex-col items-center py-8">
            <div aria-hidden="true" className="h-1 w-full" ref={sentinelRef} />
            {isLoading ? (
              <p aria-live="polite" className="text-sm text-default-500">
                {t.products.loading}
              </p>
            ) : !hasError ? (
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-default-200/70 px-5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => void loadMore()}
                type="button"
              >
                {t.products.loadMore}
              </button>
            ) : null}
          </div>
        ) : products.length > 0 ? (
          <p
            aria-live="polite"
            className="py-10 text-center text-sm text-default-500"
          >
            {t.products.endOfList}
          </p>
        ) : null}
      </section>
    </div>
  );
}
