import HomeClient from "./home-client";

import { getViewerContext } from "@/lib/viewer";
import { getPublicUsers } from "@/lib/user";
import { serializePublicUsers } from "@/lib/serializers";
import { parsePublicUserFilters } from "@/lib/search-params";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const [viewer, rawSearchParams] = await Promise.all([
    getViewerContext(),
    searchParams,
  ]);
  const filters = parsePublicUserFilters(rawSearchParams);
  const users = serializePublicUsers(await getPublicUsers(filters));

  return (
    <HomeClient
      initialFilters={{
        searchQuery: filters.searchQuery || "",
        availability: filters.availability || null,
        english: filters.english || "",
        country: filters.country || "",
      }}
      initialUsers={users}
      isAuthenticated={!!viewer.session.user}
    />
  );
}
