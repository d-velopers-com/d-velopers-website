import { NextRequest, NextResponse } from "next/server";

import { serializePublicUsers } from "@/lib/serializers";
import { parsePublicUserSearchParams } from "@/lib/search-params";
import { getPublicUsersPage, PUBLIC_USERS_PAGE_SIZE } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { filters, page } = parsePublicUserSearchParams(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const usersPage = await getPublicUsersPage(filters, {
      page,
      limit: PUBLIC_USERS_PAGE_SIZE,
    });

    return NextResponse.json({
      users: serializePublicUsers(usersPage.users),
      pagination: {
        page: usersPage.page,
        limit: usersPage.limit,
        total: usersPage.total,
        totalPages: usersPage.totalPages,
      },
    });
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
