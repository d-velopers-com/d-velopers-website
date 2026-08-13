"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { SearchIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/language-context";
import { useSessionContext } from "@/contexts/session-context";
import { Availability } from "@/lib/constants";
import { countries } from "@/lib/countries";
import { gradients, typography } from "@/lib/ui-constants";
import { debounce, filtersToSearchParams } from "@/lib/utils";
import { SearchFilters } from "@/types";

interface HomeClientProps {
  initialFilters: {
    searchQuery: string;
    availability: Availability | null;
    english: string;
    country: string;
  };
  initialPage: number;
  totalPages: number;
  totalUsers: number;
  children: ReactNode;
}

export default function HomeClient({
  initialFilters,
  initialPage,
  totalPages,
  totalUsers,
  children,
}: HomeClientProps) {
  const previousQueryRef = useRef("");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const session = useSessionContext();
  const isAuthenticated = !!session.user;
  const activeFacetCount = [
    filters.availability,
    filters.english,
    filters.country,
  ].filter(Boolean).length;
  const hasActiveFilters = Boolean(
    filters.searchQuery?.trim() || activeFacetCount,
  );
  const inputClasses =
    "w-full rounded-2xl border border-default-200/70 bg-content1 text-base text-foreground shadow-sm outline-none transition placeholder:text-default-500 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const filterClasses =
    "h-11 rounded-xl border border-default-200/80 bg-content1 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  const clearButtonClasses =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-default-600 transition hover:bg-default-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";
  const primaryButtonClasses =
    "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30";

  useEffect(() => {
    setFilters(initialFilters);
    previousQueryRef.current = initialFilters.searchQuery;
  }, [initialFilters]);

  const navigateWithFilters = useCallback(
    (nextFilters: SearchFilters, nextPage = 1) => {
      const queryString = filtersToSearchParams({
        ...nextFilters,
        page: nextPage > 1 ? nextPage : undefined,
      }).toString();
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router],
  );

  const debouncedNavigate = useMemo(
    () =>
      debounce(
        (nextFilters: SearchFilters) => navigateWithFilters(nextFilters, 1),
        500,
      ),
    [navigateWithFilters],
  );

  useEffect(() => () => debouncedNavigate.cancel(), [debouncedNavigate]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => {
    if (key === "searchQuery") {
      const queryValue = value as string;
      if (queryValue.length > 200) {
        value = queryValue.slice(0, 200) as SearchFilters[K];
      }
    }

    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);

    if (key === "searchQuery") {
      const currentQuery = value as string;
      const previousQuery = previousQueryRef.current;
      const trimmedQuery = currentQuery.trim();
      const endsWithSpace = currentQuery !== currentQuery.trimEnd();
      const isAddingContent = currentQuery.length > previousQuery.length;
      const isOnlySpaces = currentQuery.length > 0 && trimmedQuery === "";

      previousQueryRef.current = currentQuery;

      if (isOnlySpaces || (endsWithSpace && isAddingContent)) {
        return;
      }

      debouncedNavigate(nextFilters);
      return;
    }

    debouncedNavigate.cancel();
    navigateWithFilters(nextFilters, 1);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchQuery: "",
      availability: null,
      english: "",
      country: "",
    };

    debouncedNavigate.cancel();
    setFilters(emptyFilters);
    previousQueryRef.current = "";
    navigateWithFilters(emptyFilters, 1);
  };

  return (
    <div
      className={`min-h-screen px-4 pb-12 pt-6 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 mt-0">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t.home.directoryEyebrow}
          </p>
          <h1
            className={`${typography.h1} mb-3 min-h-[2.5rem] text-center text-foreground`}
          >
            {t.home.title}
          </h1>
          <p
            className={`${typography.bodyLarge} mx-auto mb-7 min-h-[1.5rem] max-w-2xl text-center`}
          >
            {t.home.subtitle}
          </p>

          <div className="mx-auto max-w-5xl rounded-3xl border border-default-200/70 bg-content1/90 p-3 shadow-sm sm:p-5">
            <div className="relative flex gap-2">
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-default-400"
                size={20}
              />
              <input
                aria-label={t.home.searcher.placeholder}
                className={`${inputClasses} h-14 pl-12 pr-4`}
                placeholder={t.home.searcher.placeholder}
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
              />
              <button
                aria-label={
                  showFilters
                    ? t.home.searcher.hideFilters
                    : t.home.searcher.showFilters
                }
                aria-expanded={showFilters}
                className="inline-flex h-14 min-w-fit items-center justify-center gap-2 rounded-xl border border-default-200/70 bg-content1 px-4 text-sm font-semibold text-foreground transition hover:bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary/20 md:hidden"
                type="button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>{t.home.searcher.filtersLabel}</span>
                {activeFacetCount > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                    {activeFacetCount}
                  </span>
                ) : null}
              </button>
            </div>

            <div className="mt-4">
              <div className="hidden md:grid md:grid-cols-3 md:gap-3">
                <label className="flex flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                  {t.home.searcher.filters.english}
                  <select
                    className={filterClasses}
                    value={filters.english || ""}
                    onChange={(e) => updateFilter("english", e.target.value)}
                  >
                    <option value="">{t.home.searcher.anyOption}</option>
                    {t.dashboard.englishLevels.map((level) => (
                      <option key={level.key} value={level.key}>
                        {level.text}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                  {t.home.searcher.filters.availability}
                  <select
                    className={filterClasses}
                    value={filters.availability || ""}
                    onChange={(e) =>
                      updateFilter(
                        "availability",
                        e.target.value
                          ? (e.target.value as Availability)
                          : null,
                      )
                    }
                  >
                    <option value="">{t.home.searcher.anyOption}</option>
                    <option value={Availability.FREELANCE}>
                      {t.dashboard.availabilityFreelance}
                    </option>
                    <option value={Availability.PART_TIME}>
                      {t.dashboard.availabilityPartTime}
                    </option>
                    <option value={Availability.FULL_TIME}>
                      {t.dashboard.availabilityFullTime}
                    </option>
                    <option value={Availability.CONSULTING}>
                      {t.dashboard.availabilityConsulting}
                    </option>
                    <option value={Availability.NOT_AVAILABLE}>
                      {t.dashboard.availabilityNotAvailable}
                    </option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                  {t.home.searcher.filters.country}
                  <select
                    className={filterClasses}
                    value={filters.country || ""}
                    onChange={(e) => updateFilter("country", e.target.value)}
                  >
                    <option value="">{t.home.searcher.anyOption}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {showFilters ? (
                <div className="overflow-hidden md:hidden">
                  <div className="space-y-3 pt-1">
                    <label className="flex w-full flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                      {t.home.searcher.filters.english}
                      <select
                        className={`${filterClasses} w-full`}
                        value={filters.english || ""}
                        onChange={(e) =>
                          updateFilter("english", e.target.value)
                        }
                      >
                        <option value="">{t.home.searcher.anyOption}</option>
                        {t.dashboard.englishLevels.map((level) => (
                          <option key={level.key} value={level.key}>
                            {level.text}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex w-full flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                      {t.home.searcher.filters.availability}
                      <select
                        className={`${filterClasses} w-full`}
                        value={filters.availability || ""}
                        onChange={(e) =>
                          updateFilter(
                            "availability",
                            e.target.value
                              ? (e.target.value as Availability)
                              : null,
                          )
                        }
                      >
                        <option value="">{t.home.searcher.anyOption}</option>
                        <option value={Availability.FREELANCE}>
                          {t.dashboard.availabilityFreelance}
                        </option>
                        <option value={Availability.PART_TIME}>
                          {t.dashboard.availabilityPartTime}
                        </option>
                        <option value={Availability.FULL_TIME}>
                          {t.dashboard.availabilityFullTime}
                        </option>
                        <option value={Availability.CONSULTING}>
                          {t.dashboard.availabilityConsulting}
                        </option>
                        <option value={Availability.NOT_AVAILABLE}>
                          {t.dashboard.availabilityNotAvailable}
                        </option>
                      </select>
                    </label>
                    <label className="flex w-full flex-col gap-1.5 text-left text-xs font-semibold text-default-600">
                      {t.home.searcher.filters.country}
                      <select
                        className={`${filterClasses} w-full`}
                        value={filters.country || ""}
                        onChange={(e) =>
                          updateFilter("country", e.target.value)
                        }
                      >
                        <option value="">{t.home.searcher.anyOption}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {hasActiveFilters ? (
                      <div className="w-full pt-1">
                        <button
                          className={`${clearButtonClasses} w-full`}
                          type="button"
                          onClick={clearFilters}
                        >
                          {t.home.searcher.clearFilters}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-labelledby="directory-results-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2
                className={`${typography.h3} text-foreground`}
                id="directory-results-heading"
              >
                {t.home.resultsHeading}
              </h2>
              <p aria-live="polite" className="mt-1 text-sm text-default-500">
                {t.home.resultsCount.replace("{count}", String(totalUsers))}
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                className={clearButtonClasses}
                type="button"
                onClick={clearFilters}
              >
                {t.home.searcher.clearFilters}
              </button>
            ) : null}
          </div>

          {isPending ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="min-h-[140px] animate-pulse rounded-2xl border border-default-200/70 bg-content1 p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-default-200/80" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded-full bg-default-200/80" />
                      <div className="h-3 w-4/5 rounded-full bg-default-200/70" />
                      <div className="h-3 w-1/3 rounded-full bg-default-200/60" />
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-default-200/70" />
                    <div className="h-6 w-20 rounded-full bg-default-200/70" />
                    <div className="h-6 w-14 rounded-full bg-default-200/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : totalUsers === 0 ? (
            <div className="py-32 text-center">
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <SearchIcon size={28} />
              </div>
              <p
                className={`mb-8 text-default-600 dark:text-default-300 ${typography.bodyLarge}`}
              >
                {t.home.noProfiles}
              </p>
              {!isAuthenticated ? (
                <Link className={`mt-4 ${primaryButtonClasses}`} href="/login">
                  {t.home.beFirst}
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              {children}
              {totalPages > 1 ? (
                <nav
                  aria-label={t.home.paginationLabel}
                  className="flex items-center justify-center gap-1 pt-8 sm:gap-3"
                >
                  <button
                    className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-default-200/70 bg-content1 px-3 text-sm font-medium text-default-600 transition hover:bg-default-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={initialPage === 1 || isPending}
                    type="button"
                    onClick={() =>
                      navigateWithFilters(filters, initialPage - 1)
                    }
                  >
                    {t.home.previousPage}
                  </button>
                  <p
                    aria-live="polite"
                    className="min-w-[84px] text-center text-xs text-default-600 sm:min-w-[110px] sm:text-sm dark:text-default-300"
                  >
                    {t.home.pageLabel} {initialPage} / {totalPages}
                  </p>
                  <button
                    className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border border-default-200/70 bg-content1 px-3 text-sm font-medium text-default-600 transition hover:bg-default-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={initialPage === totalPages || isPending}
                    type="button"
                    onClick={() =>
                      navigateWithFilters(filters, initialPage + 1)
                    }
                  >
                    {t.home.nextPage}
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
