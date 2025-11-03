import { NextResponse } from "next/server";

import { getPublicUsers } from "@/lib/user";

function getRolePriority(userRoles: string[], allowedRoles: string[]): number {
  for (let i = 0; i < allowedRoles.length; i++) {
    if (userRoles.includes(allowedRoles[i])) {
      return i;
    }
  }

  return allowedRoles.length;
}

export async function GET() {
  try {
    const users = await getPublicUsers();

    const allowedRolesEnv = process.env.ALLOWED_ROLES || "";
    const allowedRoles = allowedRolesEnv
      .split(",")
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    const sortedUsers = users.sort((a, b) => {
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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
