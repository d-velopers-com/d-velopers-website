import { NextRequest, NextResponse } from "next/server";

import { getPublicUsers } from "@/lib/user";
import { SearchFilters } from "@/types";
import { Availability } from "@/lib/constants";
import { getCountryByCode } from "@/lib/countries";

const VALID_ENGLISH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VALID_AVAILABILITY = Object.values(Availability);
const MAX_SEARCH_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    let searchQuery = searchParams.get("searchQuery");
    if (searchQuery) {
      searchQuery = searchQuery.trim();
      if (searchQuery.length > MAX_SEARCH_QUERY_LENGTH) {
        return NextResponse.json(
          { error: `Search query must be ${MAX_SEARCH_QUERY_LENGTH} characters or less` },
          { status: 400 }
        );
      }
      if (searchQuery.length === 0) {
        searchQuery = null;
      }
    }

    let english = searchParams.get("english");
    if (english) {
      if (!VALID_ENGLISH_LEVELS.includes(english)) {
        return NextResponse.json(
          { error: `Invalid english level. Must be one of: ${VALID_ENGLISH_LEVELS.join(", ")}` },
          { status: 400 }
        );
      }
    }

    let availability = searchParams.get("availability") as Availability | null;
    if (availability) {
      if (!VALID_AVAILABILITY.includes(availability)) {
        return NextResponse.json(
          { error: `Invalid availability. Must be one of: ${VALID_AVAILABILITY.join(", ")}` },
          { status: 400 }
        );
      }
    }

    let country = searchParams.get("country");
    if (country) {
      country = country.trim().toUpperCase();
      if (country.length !== 2) {
        return NextResponse.json(
          { error: "Country code must be 2 characters (ISO 3166-1 alpha-2)" },
          { status: 400 }
        );
      }
      if (!getCountryByCode(country)) {
        return NextResponse.json(
          { error: "Invalid country code" },
          { status: 400 }
        );
      }
    }

    const filters: SearchFilters = {
      searchQuery: searchQuery && searchQuery.length > 0 ? searchQuery : undefined,
      english: english || undefined,
      availability: availability || undefined,
      country: country || undefined,
    };
    const users = await getPublicUsers(filters);

    const normalizedUsers = users.map((user) => ({
      ...user,
      contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    }));

    return NextResponse.json({ users: normalizedUsers });
  } catch (error) {
    console.error("Error fetching public users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
