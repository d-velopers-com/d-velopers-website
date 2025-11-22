import { NextRequest, NextResponse } from "next/server";

import { getPublicUsers } from "@/lib/user";
import {SearchFilters} from "@/types";
import {Availability} from "@/lib/constants";

function getRolePriority(userRoles: string[], allowedRoles: string[]): number {
  for (let i = 0; i < allowedRoles.length; i++) {
    if (userRoles.includes(allowedRoles[i])) {
      return i;
    }
  }

  return allowedRoles.length;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: SearchFilters = {
      searchQuery: searchParams.get("searchQuery") || undefined,
      english: searchParams.get("english") || undefined,
      availability: searchParams.get("availability") as Availability || undefined,
      country: searchParams.get("country") || undefined,
    };
    const users = await getPublicUsers(filters);

    // Asegurar que contactLinks siempre sea un array
    const normalizedUsers = users.map((user) => ({
      ...user,
      contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    }));

    const allowedRolesEnv = process.env.ALLOWED_ROLES || "";
    const allowedRoles = allowedRolesEnv
      .split(",")
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    const sortedUsers = normalizedUsers.sort((a, b) => {
      const aPriority = getRolePriority(a.roles, allowedRoles);
      const bPriority = getRolePriority(b.roles, allowedRoles);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      if (a.joinedServerAt && b.joinedServerAt) {
        return (
          new Date(a.joinedServerAt).getTime() -
          new Date(b.joinedServerAt).getTime()
        );
      }

      if (a.joinedServerAt) return -1;
      if (b.joinedServerAt) return 1;

      return 0;
    });

    return NextResponse.json({ users: sortedUsers });
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
