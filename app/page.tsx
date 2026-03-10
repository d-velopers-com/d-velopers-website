import HomeClient from "./home-client";

import { UserCard } from "@/features/users/components/UserCard";
import { serializePublicUsers } from "@/lib/serializers";
import { parsePublicUserSearchParams } from "@/lib/search-params";
import { getPublicUsersPage, PUBLIC_USERS_PAGE_SIZE } from "@/lib/user";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const rawSearchParams = await searchParams;
  const { filters, page } = parsePublicUserSearchParams(rawSearchParams);
  const usersPage = await getPublicUsersPage(filters, {
    page,
    limit: PUBLIC_USERS_PAGE_SIZE,
  });
  const users = serializePublicUsers(usersPage.users);

  return (
    <HomeClient
      initialFilters={{
        searchQuery: filters.searchQuery || "",
        availability: filters.availability || null,
        english: filters.english || "",
        country: filters.country || "",
      }}
      initialPage={usersPage.page}
      totalPages={usersPage.totalPages}
      totalUsers={usersPage.total}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.handler} user={user} />
        ))}
      </div>
    </HomeClient>
  );
}
