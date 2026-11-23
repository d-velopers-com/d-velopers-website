import type { Metadata } from "next";

import { getProductsPage } from "@/lib/products";

import ProductsClient from "./products-client";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore products, tools, and side projects built by the D-velopers community.",
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
