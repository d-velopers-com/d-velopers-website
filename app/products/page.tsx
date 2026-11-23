import type { Metadata } from "next";

import { getProductsPage } from "@/lib/products";

import ProductsClient from "./products-client";

export const metadata: Metadata = {
  title: "Products",
  description: "Discover products, tools, and side projects from D-velopers.",
};

export default async function ProductsPage() {
  const initialPage = await getProductsPage();

  return (
    <ProductsClient
      initialCursor={initialPage.nextCursor}
      initialHasMore={initialPage.hasMore}
      initialProducts={initialPage.products}
    />
  );
}
