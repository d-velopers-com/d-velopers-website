import { NextResponse } from "next/server";

import { getPublicUsers } from "@/lib/user";

export async function GET() {
  try {
    const users = await getPublicUsers();

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
