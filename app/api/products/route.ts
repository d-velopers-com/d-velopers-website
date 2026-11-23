import { NextRequest, NextResponse } from "next/server";

import {
  getProductsPage,
  InvalidProductsCursorError,
} from "@/lib/products";

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");

  try {
    return NextResponse.json(await getProductsPage(cursor));
  } catch (error) {
    if (error instanceof InvalidProductsCursorError) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
