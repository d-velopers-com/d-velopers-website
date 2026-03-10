"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useLanguage } from "@/contexts/language-context";
import { useSessionContext } from "@/contexts/session-context";
import { SearchIcon } from "@/components/icons";
import { countries } from "@/lib/countries";
import { Availability } from "@/lib/constants";
import { debounce, filtersToSearchParams } from "@/lib/utils";
import { SearchFilters } from "@/types";
import { gradients, typography } from "@/lib/ui-constants";

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
  const inputClasses =
    "w-full rounded-2xl border border-default-200/70 bg-content1 text-base text-foreground shadow-sm outline-none transition placeholder:text-default-500 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const filterClasses =
    "h-10 rounded-xl border border-default-200/70 bg-content1 px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  const clearButtonClasses =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-default-600 transition hover:bg-default-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";
  const primaryButtonClasses =
    "inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30";

  useEffect(() => {
    setFilters(initialFilters);
    previousQueryRef.current = initialFilters.searchQuery;
  }, [initialFilters]);

  const navigateWithFilters = (
    nextFilters: SearchFilters,
    nextPage = 1,
  ) => {
    const queryString = filtersToSearchParams({
      ...nextFilters,
      page: nextPage > 1 ? nextPage : undefined,
    }).toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const debouncedNavigate = useMemo(
    () =>
      debounce(
        (nextFilters: SearchFilters) => navigateWithFilters(nextFilters, 1),
        500,
      ),
    [pathname, router],
  );

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

    navigateWithFilters(nextFilters, 1);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchQuery: "",
      availability: null,
      english: "",
      country: "",
    };

    setFilters(emptyFilters);
    previousQueryRef.current = "";
    navigateWithFilters(emptyFilters, 1);
  };

  return (
    <div
      className={`min-h-screen px-4 pb-12 pt-6 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="mx-auto max-w-7xl">
        <section className="mb-12 mt-0 text-center">
          <h1 className={`${typography.h1} mb-4 min-h-[2.5rem] text-foreground`}>
            {t.home.title}
          </h1>
          <p
            className={`${typography.bodyLarge} mx-auto mb-8 min-h-[1.5rem] max-w-2xl`}
          >
            {t.home.subtitle}
          </p>

          <div className="max-w-4xl mx-auto mb-8 space-y-4">
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
                className="inline-flex h-14 min-w-14 items-center justify-center rounded-xl border border-default-200/70 bg-content1 text-foreground shadow-sm transition hover:bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary/20 md:hidden"
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
              </button>
            </div>

            <div>
              <div className="hidden md:flex md:flex-wrap md:items-center md:justify-center md:gap-3">
                <select
                  aria-label={t.home.searcher.filters.english}
                  className={`${filterClasses} min-w-[200px]`}
                  value={filters.english || ""}
                  onChange={(e) => updateFilter("english", e.target.value)}
                >
                  <option value="">{t.home.searcher.filters.english}</option>
                  {t.dashboard.englishLevels.map((level) => (
                    <option key={level.key} value={level.key}>
                      {level.text}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t.home.searcher.filters.availability}
                  className={`${filterClasses} min-w-[200px]`}
                  value={filters.availability || ""}
                  onChange={(e) =>
                    updateFilter(
                      "availability",
                      e.target.value ? (e.target.value as Availability) : null,
                    )
                  }
                >
                  <option value="">{t.home.searcher.filters.availability}</option>
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
                <select
                  aria-label={t.home.searcher.filters.country}
                  className={`${filterClasses} w-[200px]`}
                  value={filters.country || ""}
                  onChange={(e) => updateFilter("country", e.target.value)}
                >
                  <option value="">{t.home.searcher.filters.country}</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <button
                  className={clearButtonClasses}
                  type="button"
                  onClick={clearFilters}
                >
                  {t.home.searcher.clearFilters}
                </button>
              </div>

              {showFilters ? (
                <div className="overflow-hidden md:hidden">
                  <div className="space-y-3 pt-3">
                    <div className="w-full">
                      <select
                        aria-label={t.home.searcher.filters.english}
                        className={`${filterClasses} w-full`}
                        value={filters.english || ""}
                        onChange={(e) => updateFilter("english", e.target.value)}
                      >
                        <option value="">{t.home.searcher.filters.english}</option>
                        {t.dashboard.englishLevels.map((level) => (
                          <option key={level.key} value={level.key}>
                            {level.text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <select
                        aria-label={t.home.searcher.filters.availability}
                        className={`${filterClasses} w-full`}
                        value={filters.availability || ""}
                        onChange={(e) =>
                          updateFilter(
                            "availability",
                            e.target.value ? (e.target.value as Availability) : null,
                          )
                        }
                      >
                        <option value="">{t.home.searcher.filters.availability}</option>
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
                    </div>
                    <div className="w-full">
                      <select
                        aria-label={t.home.searcher.filters.country}
                        className={`${filterClasses} w-full`}
                        value={filters.country || ""}
                        onChange={(e) => updateFilter("country", e.target.value)}
                      >
                        <option value="">{t.home.searcher.filters.country}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full pt-2">
                      <button
                        className={`${clearButtonClasses} w-full`}
                        type="button"
                        onClick={clearFilters}
                      >
                        {t.home.searcher.clearFilters}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-labelledby="directory-results-heading">
          <h2 className="sr-only" id="directory-results-heading">
            {t.home.resultsHeading}
          </h2>

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
              <div className="mb-8 text-8xl" aria-hidden="true">
                👥
              </div>
              <p
                className={`mb-8 text-default-600 dark:text-default-300 ${typography.bodyLarge}`}
              >
                {t.home.noProfiles}
              </p>
              {!isAuthenticated ? (
                <Link
                  className={`mt-4 ${primaryButtonClasses}`}
                  href="/login"
                >
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
                  className="flex items-center justify-center gap-3 pt-8"
                >
                  <button
                    className={`${clearButtonClasses} border border-default-200/70 bg-content1 disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={initialPage === 1 || isPending}
                    type="button"
                    onClick={() => navigateWithFilters(filters, initialPage - 1)}
                  >
                    {t.home.previousPage}
                  </button>
                  <p
                    aria-live="polite"
                    className="min-w-[110px] text-center text-sm text-default-600 dark:text-default-300"
                  >
                    {t.home.pageLabel} {initialPage} / {totalPages}
                  </p>
                  <button
                    className={`${clearButtonClasses} border border-default-200/70 bg-content1 disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={initialPage === totalPages || isPending}
                    type="button"
                    onClick={() => navigateWithFilters(filters, initialPage + 1)}
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
