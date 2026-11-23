"use client";

import type { ProductListItem, ProductsPage } from "@/lib/products";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/contexts/language-context";
import { getDiscordAvatarProxyUrl } from "@/shared/lib";

interface ProductsClientProps {
  initialProducts: ProductListItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

function CreatorAvatar({ creator }: { creator: ProductListItem["creator"] }) {
  const initial = creator.name?.trim().charAt(0).toUpperCase() || "D";

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-default-200/70">
      {creator.profilePublic && creator.discordId ? (
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          height={40}
          sizes="40px"
          src={getDiscordAvatarProxyUrl(
            creator.discordId,
            creator.avatar,
            creator.discriminator || "0",
            80,
          )}
          width={40}
        />
      ) : (
        initial
      )}
    </span>
  );
}

function ProductCard({ product }: { product: ProductListItem }) {
  const { t } = useLanguage();
  const domain = getHostname(product.url);

  return (
    <article className="group flex h-full min-h-[280px] flex-col rounded-2xl border border-default-200/70 bg-content1 p-5 transition-colors hover:border-primary/40">
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <svg
            aria-hidden="true"
            className="h-5 w-5"
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
            <path
              d="m5 7.5 7 3.75 7-3.75M12 11.5v8.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
        <a
          aria-label={`${t.products.openProduct}: ${product.title}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-default-200/70 px-3 text-xs font-semibold text-default-600 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href={product.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.products.openProduct}
          <span aria-hidden="true" className="text-sm">
            ↗
          </span>
        </a>
      </div>

      <p className="mb-2 truncate font-mono text-xs text-primary">{domain}</p>
      <h2 className="line-clamp-2 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {product.title}
      </h2>
      <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-default-600">
        {product.description || t.products.noDescription}
      </p>

      <div className="mt-auto flex items-center gap-3 border-t border-default-200/60 pt-4">
        <CreatorAvatar creator={product.creator} />
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-default-500">
            {t.products.createdBy}
          </p>
          {product.creator.profilePublic && product.creator.handler ? (
            <Link
              className="mt-0.5 block truncate text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={`/users/${product.creator.handler}`}
            >
              {product.creator.name}
              <span className="ml-1 font-normal text-default-500">
                @{product.creator.handler}
              </span>
            </Link>
          ) : (
            <p className="mt-0.5 truncate text-sm font-medium text-default-500">
              {t.products.communityMember}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="motion-safe:animate-pulse flex min-h-[280px] flex-col rounded-2xl border border-default-200/60 bg-content1 p-5"
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-default-100" />
        <div className="h-10 w-28 rounded-full bg-default-100" />
      </div>
      <div className="h-3 w-1/3 rounded bg-default-100" />
      <div className="mt-3 h-6 w-4/5 rounded bg-default-100" />
      <div className="mt-4 h-3 w-full rounded bg-default-100" />
      <div className="mt-2 h-3 w-11/12 rounded bg-default-100" />
      <div className="mt-auto flex items-center gap-3 border-t border-default-200/60 pt-4">
        <div className="h-10 w-10 rounded-full bg-default-100" />
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded bg-default-100" />
          <div className="h-3 w-32 rounded bg-default-100" />
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
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <header className="relative overflow-hidden rounded-3xl border border-default-200/70 bg-content1 px-6 py-8 sm:px-10 sm:py-11">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full border border-primary/15 sm:h-64 sm:w-64"
        />
        <div
          aria-hidden="true"
          className="absolute right-7 top-7 h-24 w-24 rounded-full border border-primary/10 sm:right-12 sm:top-12 sm:h-40 sm:w-40"
        />
        <div className="relative max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t.products.eyebrow}
          </p>
          <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.products.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-default-600 sm:text-lg sm:leading-8">
            {t.products.description}
          </p>
        </div>
      </header>

      <section aria-labelledby="products-heading" className="mt-10 sm:mt-14">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <p aria-live="polite" className="py-10 text-center text-sm text-default-500">
            {t.products.endOfList}
          </p>
        ) : null}
      </section>
    </div>
  );
}
