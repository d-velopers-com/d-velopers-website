import { PostStatus } from "@prisma/client";

import { getCountryByCode } from "@/lib/countries";
import { Availability } from "@/lib/constants";
import type { SearchFilters } from "@/types";

type SearchParamValue = string | string[] | undefined;
type SearchParamRecord = Record<string, SearchParamValue>;

function getFirstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePublicUserFilters(
  searchParams: SearchParamRecord,
): SearchFilters {
  const searchQuery = getFirstValue(searchParams.searchQuery)?.trim();
  const english = getFirstValue(searchParams.english)?.trim();
  const availability = getFirstValue(searchParams.availability);
  const countryValue = getFirstValue(searchParams.country)?.trim().toUpperCase();

  return {
    searchQuery:
      searchQuery && searchQuery.length <= 200 ? searchQuery : undefined,
    english:
      english && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(english)
        ? english
        : undefined,
    availability:
      availability && Object.values(Availability).includes(availability as Availability)
        ? (availability as Availability)
        : undefined,
    country:
      countryValue && countryValue.length === 2 && getCountryByCode(countryValue)
        ? countryValue
        : undefined,
  };
}

function parsePageValue(value: SearchParamValue) {
  const pageValue = Number.parseInt(getFirstValue(value) || "1", 10);

  return Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
}

export function parsePublicUserSearchParams(searchParams: SearchParamRecord) {
  return {
    filters: parsePublicUserFilters(searchParams),
    page: parsePageValue(searchParams.page),
  };
}

export function parseJobsSearchParams(searchParams: SearchParamRecord) {
  const search = getFirstValue(searchParams.search)?.trim() || "";

  return {
    page: parsePageValue(searchParams.page),
    search: search.slice(0, 200),
  };
}

export function parseManagePostsSearchParams(searchParams: SearchParamRecord) {
  const statusParam = getFirstValue(searchParams.status)?.trim().toUpperCase();

  return {
    page: parsePageValue(searchParams.page),
    status:
      statusParam && Object.values(PostStatus).includes(statusParam as PostStatus)
        ? (statusParam as PostStatus)
        : undefined,
  };
}
