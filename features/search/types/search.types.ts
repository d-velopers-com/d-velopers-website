import { Availability } from "@/shared/constants";

/**
 * Search filters for user listings
 */
export interface SearchFilters {
    searchQuery: string;
    availability: Availability | null;
    english: string;
    country: string;
}

/**
 * Initial empty state for filters
 */
export const INITIAL_FILTERS: SearchFilters = {
    searchQuery: "",
    availability: null,
    english: "",
    country: "",
};
