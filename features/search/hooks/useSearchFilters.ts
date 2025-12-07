"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDebounce } from "@/shared/hooks";
import { SearchFilters, INITIAL_FILTERS } from "../types";

interface UseSearchFiltersOptions {
    onFiltersChange: (filters: SearchFilters) => void;
    debounceMs?: number;
}

/**
 * Hook for managing search filters with debounced search query
 */
export function useSearchFilters({
    onFiltersChange,
    debounceMs = 500,
}: UseSearchFiltersOptions) {
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
    const [searchInput, setSearchInput] = useState("");
    const previousQueryRef = useRef("");

    // Debounce only the search query
    const debouncedSearch = useDebounce(searchInput, debounceMs);

    // Update parent when debounced search changes
    useEffect(() => {
        const currentFilters = { ...filters, searchQuery: debouncedSearch };
        onFiltersChange(currentFilters);
    }, [debouncedSearch]);

    const updateFilter = useCallback(
        <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
            if (key === "searchQuery") {
                let queryValue = value as string;
                // Limit to 200 characters
                if (queryValue.length > 200) {
                    queryValue = queryValue.slice(0, 200);
                }

                const previousQuery = previousQueryRef.current;
                const trimmedQuery = queryValue.trim();
                const endsWithSpace = queryValue !== queryValue.trimEnd();
                const isAddingContent = queryValue.length > previousQuery.length;
                const isOnlySpaces = queryValue.length > 0 && trimmedQuery === "";

                // Skip debounce trigger if only adding spaces
                if (isOnlySpaces || (endsWithSpace && isAddingContent)) {
                    previousQueryRef.current = queryValue;
                    setSearchInput(queryValue);
                    return;
                }

                previousQueryRef.current = queryValue;
                setSearchInput(queryValue);
            } else {
                setFilters((prev) => {
                    const next = { ...prev, [key]: value };
                    onFiltersChange({ ...next, searchQuery: debouncedSearch });
                    return next;
                });
            }
        },
        [debouncedSearch, onFiltersChange]
    );

    const clearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setSearchInput("");
        previousQueryRef.current = "";
        onFiltersChange(INITIAL_FILTERS);
    }, [onFiltersChange]);

    const hasActiveFilters = useMemo(() => {
        return Boolean(
            searchInput ||
            filters.availability ||
            filters.english ||
            filters.country
        );
    }, [searchInput, filters]);

    return {
        filters: { ...filters, searchQuery: searchInput },
        updateFilter,
        clearFilters,
        hasActiveFilters,
    };
}
