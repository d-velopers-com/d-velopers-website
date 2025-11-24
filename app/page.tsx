"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Input } from "@heroui/input";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { getCountryFlagUrl, getCountryName } from "@/lib/countries";
import { SearchIcon } from "@/components/icons";
import { Select, SelectItem } from "@heroui/select";
import { Availability } from "@/lib/constants";
import { CountrySelect } from "@/components/country-select";
import {debounce, filtersToSearchParams} from "@/lib/search-utils";
import { SearchFilters } from "@/types";
import {
  cardStyles,
  typography,
  chipStyles,
  avatarStyles,
  gradients,
  spacing,
  focusStates,
  borderRadius,
} from "@/lib/ui-constants";

interface PublicUser {
  handler: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  discordId: string;
  name: string | null;
  title: string | null;
  country: string | null;
  tags: string[];
  roles: string[];
  joinedServerAt: string | null;
  createdAt: string;
}

export default function Home() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleTagsCount, setVisibleTagsCount] = useState<
    Record<string, number>
  >({});
  const tagsContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousQueryRef = useRef("");
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    availability: null,
    english: "",
    country: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const { status } = useSession();

  const fetchUsers = useCallback(async (currentFilters: SearchFilters) => {
    setLoading(true);
    try {
      const queryString = filtersToSearchParams(currentFilters).toString();
      const url = `/api/users/public${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce((filters: SearchFilters) => fetchUsers(filters), 500),
    [fetchUsers],
  );

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    if (key === "searchQuery") {
      const queryValue = value as string;
      if (queryValue.length > 200) {
        value = queryValue.slice(0, 200) as SearchFilters[K];
      }
    }
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (key === "searchQuery") {
      const currentQuery = value as string;
      const previousQuery = previousQueryRef.current;
      const trimmedQuery = currentQuery.trim();
      const endsWithSpace = currentQuery !== currentQuery.trimEnd();
      const isAddingContent = currentQuery.length > previousQuery.length;
      const isOnlySpaces = currentQuery.length > 0 && trimmedQuery === "";
      if (isOnlySpaces || (endsWithSpace && isAddingContent)) {
        previousQueryRef.current = currentQuery;
        return;
      }
      previousQueryRef.current = currentQuery;
      debouncedFetch(newFilters);
    } else {
      fetchUsers(newFilters);
    }
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchQuery: "",
      availability: null,
      english: "",
      country: "",
    };
    setFilters(emptyFilters);
    fetchUsers(emptyFilters);
  };

  useEffect(() => {
    fetchUsers(filters);
  }, []);

  // Calcular cuántos chips caben en cada card
  useEffect(() => {
    const calculateVisibleTags = () => {
      const newVisibleTagsCount: Record<string, number> = {};

      Object.entries(tagsContainerRefs.current).forEach(
        ([handler, container]) => {
          if (!container) return;

          const user = users.find((u) => u.handler === handler);
          if (!user || !user.tags || user.tags.length === 0) return;

          const containerWidth = container.offsetWidth;
          // Ancho aproximado: chip pequeño (~60-80px) + gap (6px) + chip "+N" (~50px)
          const chipWidth = 70; // Ancho aproximado de un chip
          const plusChipWidth = 50; // Ancho del chip "+N"
          const gap = 6; // gap-1.5 = 6px

          // Calcular cuántos chips caben
          let availableWidth = containerWidth;
          let visibleCount = 0;

          // Siempre reservar espacio para el chip "+N" si hay más de 1 tag
          if (user.tags.length > 1) {
            availableWidth -= plusChipWidth + gap;
          }

          // Contar cuántos chips caben
          for (let i = 0; i < user.tags.length; i++) {
            if (availableWidth >= chipWidth) {
              availableWidth -= chipWidth + gap;
              visibleCount++;
            } else {
              break;
            }
          }

          // Si no cabe ninguno, mostrar al menos 1 y el "+N"
          if (visibleCount === 0 && user.tags.length > 0) {
            visibleCount = 1;
          }

          newVisibleTagsCount[handler] = visibleCount;
        },
      );

      setVisibleTagsCount(newVisibleTagsCount);
    };

    calculateVisibleTags();

    const handleResize = () => {
      calculateVisibleTags();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [users]);

  return (
    <div
      className={`min-h-screen px-4 pt-6 pb-12 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 mt-0 min-h-[120px]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1
            className={`${typography.h1} mb-4 text-foreground min-h-[2.5rem]`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {t.home.title}
          </motion.h1>
          <motion.p
            className={`${typography.bodyLarge} max-w-2xl mx-auto mb-8 min-h-[1.5rem]`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            {t.home.subtitle}
          </motion.p>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative flex gap-2">
              <Input
                aria-label={t.home.searcher.placeholder}
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-default-100 dark:bg-default-100/50 border-none h-14 rounded-2xl",
                  input: "text-base placeholder:text-default-500",
                }}
                placeholder={t.home.searcher.placeholder}
                startContent={
                  <SearchIcon className="text-default-400" size={20} />
                }
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
              />
              {/* Toggle Filters Button - Mobile Only */}
              <Button
                className="md:hidden rounded-xl h-14 min-w-14"
                isIconOnly
                variant="flat"
                onPress={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </Button>
            </div>

            {/* Filter Buttons - Desktop: Always visible, Mobile: Collapsible */}
            <div>
              {/* Desktop: Always visible */}
              <div className="hidden md:flex md:flex-wrap md:items-center md:justify-center md:gap-3">
                <Select
                  aria-label={t.home.searcher.filters.english}
                  classNames={{
                    base: "w-auto min-w-[200px]",
                    trigger: "h-10 dark:bg-default-100/50",
                    value: "font-medium text-default-700",
                    popoverContent: "rounded-xl min-w-[200px]",
                  }}
                  placeholder={t.home.searcher.filters.english}
                  selectedKeys={filters.english ? [filters.english] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    updateFilter("english", selected || "");
                  }}
                >
                  {t.dashboard.englishLevels.map((level) => (
                    <SelectItem key={level.key}>{level.text}</SelectItem>
                  ))}
                </Select>
                <Select
                  aria-label={t.home.searcher.filters.availability}
                  classNames={{
                    base: "w-auto min-w-[200px]",
                    trigger: "h-10 dark:bg-default-100/50",
                    value: "font-medium text-default-700",
                    popoverContent: "rounded-xl min-w-[200px]",
                  }}
                  placeholder={t.home.searcher.filters.availability}
                  selectedKeys={filters.availability ? [filters.availability] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as Availability;
                    updateFilter("availability", selected || null);
                  }}
                >
                  <SelectItem key={Availability.FREELANCE}>{t.dashboard.availabilityFreelance}</SelectItem>
                  <SelectItem key={Availability.PART_TIME}>{t.dashboard.availabilityPartTime}</SelectItem>
                  <SelectItem key={Availability.FULL_TIME}>{t.dashboard.availabilityFullTime}</SelectItem>
                  <SelectItem key={Availability.CONSULTING}>{t.dashboard.availabilityConsulting}</SelectItem>
                  <SelectItem key={Availability.NOT_AVAILABLE}>{t.dashboard.availabilityNotAvailable}</SelectItem>
                </Select>
                <CountrySelect
                  onChange={(value) => updateFilter("country", value)}
                  placeholder={t.home.searcher.filters.country}
                  variant="flat"
                  value={filters.country || ''}
                  label=""
                  ariaLabel={t.home.searcher.filters.country}
                  classNames={{
                    base: "w-[200px]",
                    selectorButton: "h-10 rounded-xl",
                    inputWrapper: "h-10 min-h-10 rounded-xl",
                  }}
                />
                <Button
                  className="rounded-xl text-default-500"
                  variant="light"
                  onPress={clearFilters}
                >
                  {t.home.searcher.clearFilters}
                </Button>
              </div>

              {/* Mobile: Collapsible with animation */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden md:hidden"
                  >
                    <div className="space-y-3 pt-3">
                      <div className="w-full">
                        <Select
                          aria-label={t.home.searcher.filters.english}
                          classNames={{
                            base: "w-full",
                            trigger: "h-10 dark:bg-default-100/50",
                            value: "font-medium text-default-700",
                            popoverContent: "rounded-xl min-w-[200px]",
                          }}
                          placeholder={t.home.searcher.filters.english}
                          selectedKeys={filters.english ? [filters.english] : []}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            updateFilter("english", selected || "");
                          }}
                        >
                          {t.dashboard.englishLevels.map((level) => (
                            <SelectItem key={level.key}>{level.text}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="w-full">
                        <Select
                          aria-label={t.home.searcher.filters.availability}
                          classNames={{
                            base: "w-full",
                            trigger: "h-10 dark:bg-default-100/50",
                            value: "font-medium text-default-700",
                            popoverContent: "rounded-xl min-w-[200px]",
                          }}
                          placeholder={t.home.searcher.filters.availability}
                          selectedKeys={filters.availability ? [filters.availability] : []}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as Availability;
                            updateFilter("availability", selected || null);
                          }}
                        >
                          <SelectItem key={Availability.FREELANCE}>{t.dashboard.availabilityFreelance}</SelectItem>
                          <SelectItem key={Availability.PART_TIME}>{t.dashboard.availabilityPartTime}</SelectItem>
                          <SelectItem key={Availability.FULL_TIME}>{t.dashboard.availabilityFullTime}</SelectItem>
                          <SelectItem key={Availability.CONSULTING}>{t.dashboard.availabilityConsulting}</SelectItem>
                          <SelectItem key={Availability.NOT_AVAILABLE}>{t.dashboard.availabilityNotAvailable}</SelectItem>
                        </Select>
                      </div>
                      <div className="w-full">
                        <CountrySelect
                          onChange={(value) => updateFilter("country", value)}
                          placeholder={t.home.searcher.filters.country}
                          variant="flat"
                          value={filters.country || ''}
                          label=""
                          ariaLabel={t.home.searcher.filters.country}
                          classNames={{
                            base: "w-full",
                            selectorButton: "h-10 rounded-xl",
                            inputWrapper: "h-10 min-h-10 rounded-xl",
                          }}
                        />
                      </div>
                      <div className="w-full pt-2">
                        <Button
                          className="w-full rounded-xl text-default-500"
                          variant="light"
                          onPress={clearFilters}
                        >
                          {t.home.searcher.clearFilters}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {status === "unauthenticated" && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                as={Link}
                className={`${typography.buttonLg} px-8 py-6 ${focusStates.button}`}
                color="primary"
                href="/login"
                size="lg"
                variant="shadow"
              >
                {t.home.joinCommunity}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className={`p-4 overflow-hidden ${cardStyles.base}`}
              >
                <div className={`flex flex-col ${spacing.md}`}>
                  <div className={`flex items-start ${spacing.md}`}>
                    <Skeleton className="rounded-lg w-12 h-12 flex-shrink-0 shimmer" />
                    <div className={`flex-1 flex flex-col ${spacing.sm}`}>
                      <Skeleton className="rounded-lg w-3/4 h-5 shimmer" />
                      <Skeleton className="rounded-lg w-full h-4 shimmer" />
                    </div>
                  </div>
                  <div className={`flex ${spacing.sm} mt-auto`}>
                    <Skeleton className="rounded-lg w-16 h-6 shimmer" />
                    <Skeleton className="rounded-lg w-20 h-6 shimmer" />
                    <Skeleton className="rounded-lg w-14 h-6 shimmer" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="text-8xl mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              👥
            </motion.div>
            <motion.p
              className={`text-default-400 ${typography.bodyLarge} mb-8`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              {t.home.noProfiles}
            </motion.p>
            {status === "unauthenticated" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                <Button
                  as={Link}
                  className={`mt-4 ${typography.button} ${focusStates.button}`}
                  color="primary"
                  href="/login"
                  size="lg"
                  variant="shadow"
                >
                  {t.home.beFirst}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {users.map((user) => {
              const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

              const allTags = user.tags || [];
              const visibleCount =
                visibleTagsCount[user.handler] ?? allTags.length;
              const displayTags = allTags.slice(0, visibleCount);
              const remainingTags =
                allTags.length > visibleCount
                  ? allTags.length - visibleCount
                  : 0;

              return (
                <motion.div
                  key={user.handler}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.4,
                        ease: "easeOut",
                      },
                    },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`relative overflow-hidden ${cardStyles.base} ${cardStyles.hover} h-full flex flex-col h-[140px]`}
                  >
                    <CardBody className="relative p-0 flex flex-col overflow-hidden h-full">
                      <Link
                        href={`/users/${user.handler}`}
                        className="p-4 flex flex-col h-full"
                      >
                        <div className="flex items-start gap-3 flex-shrink-0 mb-2">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Avatar
                              className={`w-12 h-12 ${avatarStyles.ring}`}
                              src={avatarUrl}
                            />
                            {user.country &&
                              getCountryFlagUrl(user.country, "24") && (
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${borderRadius.outer.full} border-2 border-background bg-background flex items-center justify-center overflow-hidden shadow-sm`}
                                >
                                  <img
                                    alt={getCountryName(user.country)}
                                    className="w-full h-full object-cover rounded-full"
                                    src={getCountryFlagUrl(user.country, "24")}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                          </div>
                          <div
                            className={`flex-1 min-w-0 flex flex-col gap-1 overflow-hidden`}
                          >
                            <h3
                              className={`${typography.h3} leading-tight truncate flex-shrink-0`}
                            >
                              {user.name || user.username}
                            </h3>
                            <p
                              className={`${typography.caption} truncate overflow-hidden text-ellipsis leading-tight`}
                              title={user.title || ""}
                            >
                              {user.title || "\u00A0"}
                            </p>
                          </div>
                        </div>
                        <div
                          ref={(el) => {
                            tagsContainerRefs.current[user.handler] = el;
                          }}
                          className={`flex flex-nowrap gap-1.5 overflow-hidden mt-auto`}
                        >
                          {displayTags.map((tag) => (
                            <Chip
                              key={tag}
                              className={`${chipStyles.base} flex-shrink-0`}
                              classNames={chipStyles.classNames}
                              color="primary"
                              size="sm"
                              variant="flat"
                            >
                              {tag}
                            </Chip>
                          ))}
                          {remainingTags > 0 && (
                            <Chip
                              className={`${chipStyles.base} flex-shrink-0`}
                              color="default"
                              size="sm"
                              variant="flat"
                            >
                              +{remainingTags}
                            </Chip>
                          )}
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
