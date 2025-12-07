import { NextResponse } from "next/server";
import { accessByRole } from "@/config/access-by-role";

export async function GET() {
    return NextResponse.json({
        roles: accessByRole.collaborators,
    });
}
