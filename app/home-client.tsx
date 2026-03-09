"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

import { useLanguage } from "@/contexts/language-context";
import { SearchIcon } from "@/components/icons";
import { Availability } from "@/lib/constants";
import { CountrySelect } from "@/components/country-select";
import { debounce, filtersToSearchParams } from "@/lib/utils";
import { SearchFilters } from "@/types";
import { typography, gradients, focusStates } from "@/lib/ui-constants";
import { UserCard, UserCardSkeleton, type PublicUser } from "@/features/users";

interface HomeClientProps {
  initialUsers: PublicUser[];
  initialFilters: {
    searchQuery: string;
    availability: Availability | null;
    english: string;
    country: string;
  };
  isAuthenticated: boolean;
}

export default function HomeClient({
  initialUsers,
  initialFilters,
  isAuthenticated,
}: HomeClientProps) {
  const previousQueryRef = useRef("");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setFilters(initialFilters);
    previousQueryRef.current = initialFilters.searchQuery;
  }, [initialFilters]);

  const navigateWithFilters = (nextFilters: SearchFilters) => {
    const queryString = filtersToSearchParams(nextFilters).toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const debouncedNavigate = useMemo(
    () => debounce((nextFilters: SearchFilters) => navigateWithFilters(nextFilters), 500),
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

    navigateWithFilters(nextFilters);
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
    navigateWithFilters(emptyFilters);
  };

  return (
    <div
      className={`min-h-screen px-4 pt-6 pb-12 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 mt-0 min-h-[120px]"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className={`${typography.h1} mb-4 text-foreground min-h-[2.5rem]`}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {t.home.title}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={`${typography.bodyLarge} max-w-2xl mx-auto mb-8 min-h-[1.5rem]`}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            {t.home.subtitle}
          </motion.p>

          <div className="max-w-4xl mx-auto mb-8 space-y-4">
            <div className="relative flex gap-2">
              <Input
                aria-label={t.home.searcher.placeholder}
                classNames={{
                  base: "w-full",
                  inputWrapper:
                    "bg-default-100 dark:bg-default-100/50 border-none h-14 rounded-2xl",
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
              <Button
                aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                className="md:hidden rounded-xl h-14 min-w-14"
                isIconOnly
                variant="flat"
                onPress={() => setShowFilters(!showFilters)}
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
              </Button>
            </div>

            <div>
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
                  <SelectItem key={Availability.FREELANCE}>
                    {t.dashboard.availabilityFreelance}
                  </SelectItem>
                  <SelectItem key={Availability.PART_TIME}>
                    {t.dashboard.availabilityPartTime}
                  </SelectItem>
                  <SelectItem key={Availability.FULL_TIME}>
                    {t.dashboard.availabilityFullTime}
                  </SelectItem>
                  <SelectItem key={Availability.CONSULTING}>
                    {t.dashboard.availabilityConsulting}
                  </SelectItem>
                  <SelectItem key={Availability.NOT_AVAILABLE}>
                    {t.dashboard.availabilityNotAvailable}
                  </SelectItem>
                </Select>
                <CountrySelect
                  ariaLabel={t.home.searcher.filters.country}
                  classNames={{
                    base: "w-[200px]",
                    selectorButton: "h-10 rounded-xl",
                    inputWrapper: "h-10 min-h-10 rounded-xl",
                  }}
                  label=""
                  placeholder={t.home.searcher.filters.country}
                  value={filters.country || ""}
                  variant="flat"
                  onChange={(value) => updateFilter("country", value)}
                />
                <Button
                  className="rounded-xl text-default-500"
                  variant="light"
                  onPress={clearFilters}
                >
                  {t.home.searcher.clearFilters}
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden md:hidden"
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
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
                          <SelectItem key={Availability.FREELANCE}>
                            {t.dashboard.availabilityFreelance}
                          </SelectItem>
                          <SelectItem key={Availability.PART_TIME}>
                            {t.dashboard.availabilityPartTime}
                          </SelectItem>
                          <SelectItem key={Availability.FULL_TIME}>
                            {t.dashboard.availabilityFullTime}
                          </SelectItem>
                          <SelectItem key={Availability.CONSULTING}>
                            {t.dashboard.availabilityConsulting}
                          </SelectItem>
                          <SelectItem key={Availability.NOT_AVAILABLE}>
                            {t.dashboard.availabilityNotAvailable}
                          </SelectItem>
                        </Select>
                      </div>
                      <div className="w-full">
                        <CountrySelect
                          ariaLabel={t.home.searcher.filters.country}
                          classNames={{
                            base: "w-full",
                            selectorButton: "h-10 rounded-xl",
                            inputWrapper: "h-10 min-h-10 rounded-xl",
                          }}
                          label=""
                          placeholder={t.home.searcher.filters.country}
                          value={filters.country || ""}
                          variant="flat"
                          onChange={(value) => updateFilter("country", value)}
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
        </motion.div>

        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : initialUsers.length === 0 ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="text-8xl mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              👥
            </motion.div>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={`text-default-400 ${typography.bodyLarge} mb-8`}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              {t.home.noProfiles}
            </motion.p>
            {!isAuthenticated ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
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
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
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
            {initialUsers.map((user) => (
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
                <UserCard
                  user={user}
                  yearsLabel={
                    user.yoe && user.yoe > 1
                      ? t.home.yearsOfExperiencePlural
                      : t.home.yearsOfExperienceSingular
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
