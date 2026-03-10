import { describe, expect, it } from "vitest";
import { PostStatus } from "@prisma/client";

import { Availability } from "@/lib/constants";
import { buildPostSearchConditions } from "@/lib/posts";
import {
  parseJobsSearchParams,
  parseManagePostsSearchParams,
  parsePublicUserFilters,
  parsePublicUserSearchParams,
} from "@/lib/search-params";

describe("search param parsing", () => {
  it("normalizes public directory filters and rejects invalid values", () => {
    expect(
      parsePublicUserFilters({
        availability: Availability.FULL_TIME,
        country: "ni",
        english: "B2",
        searchQuery: "  react developer  ",
      }),
    ).toEqual({
      availability: Availability.FULL_TIME,
      country: "NI",
      english: "B2",
      searchQuery: "react developer",
    });

    expect(
      parsePublicUserFilters({
        availability: "invalid",
        country: "ZZ",
        english: "native",
        searchQuery: " ".repeat(10),
      }),
    ).toEqual({
      availability: undefined,
      country: undefined,
      english: undefined,
      searchQuery: undefined,
    });
  });

  it("uses URL params as the source of truth for public directory pagination", () => {
    expect(
      parsePublicUserSearchParams({
        availability: Availability.FULL_TIME,
        country: "ni",
        english: "B2",
        page: "3",
        searchQuery: "  react developer  ",
      }),
    ).toEqual({
      filters: {
        availability: Availability.FULL_TIME,
        country: "NI",
        english: "B2",
        searchQuery: "react developer",
      },
      page: 3,
    });

    expect(
      parsePublicUserSearchParams({
        page: "-9",
        searchQuery: "x".repeat(250),
      }),
    ).toEqual({
      filters: {
        availability: undefined,
        country: undefined,
        english: undefined,
        searchQuery: undefined,
      },
      page: 1,
    });
  });

  it("uses URL params as the source of truth for jobs search and pagination", () => {
    expect(parseJobsSearchParams({ page: "3", search: "  remote nextjs  " })).toEqual({
      page: 3,
      search: "remote nextjs",
    });

    expect(parseJobsSearchParams({ page: "-9", search: "x".repeat(250) })).toEqual({
      page: 1,
      search: "x".repeat(200),
    });
  });

  it("parses manage jobs filters with valid PostStatus only", () => {
    expect(parseManagePostsSearchParams({ page: "2", status: "approved" })).toEqual({
      page: 2,
      status: PostStatus.APPROVED,
    });

    expect(parseManagePostsSearchParams({ page: "0", status: "draft" })).toEqual({
      page: 1,
      status: undefined,
    });
  });

  it("splits post search input into title conditions for server-side querying", () => {
    expect(buildPostSearchConditions(" senior react remote ")).toEqual([
      { title: { contains: "senior", mode: "insensitive" } },
      { title: { contains: "react", mode: "insensitive" } },
      { title: { contains: "remote", mode: "insensitive" } },
    ]);
  });
});
