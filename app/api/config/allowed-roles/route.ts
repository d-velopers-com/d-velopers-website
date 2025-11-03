import { NextResponse } from "next/server";

export async function GET() {
  const allowedRolesEnv = process.env.ALLOWED_ROLES || "";
  const roles = allowedRolesEnv
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);

  return NextResponse.json({ roles });
}
