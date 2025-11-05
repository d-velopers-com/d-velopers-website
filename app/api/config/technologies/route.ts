import { NextResponse } from "next/server";
import technologies from "@/config/technologies.json";

export async function GET() {
  return NextResponse.json({ technologies });
}

