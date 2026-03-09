import { redirect } from "next/navigation";

import ManageJobsClient from "./manage-client";

import { getPosts, getPostsCount } from "@/lib/posts";
import { parseManagePostsSearchParams } from "@/lib/search-params";
import { serializePosts } from "@/lib/serializers";
import { shouldAutoApproveBotPosts } from "@/lib/system-config";
import { getUserByDiscordId } from "@/lib/user";
import { getViewerContext } from "@/lib/viewer";

const POSTS_PER_PAGE = 10;

type ManagePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ManageJobPostsPage({
  searchParams,
}: ManagePageProps) {
  const [viewer, rawSearchParams] = await Promise.all([
    getViewerContext(),
    searchParams,
  ]);

  if (!viewer.session.user) {
    redirect("/login");
  }

  if (!viewer.permissions.hasJobManagementRole) {
    redirect("/");
  }

  const user = await getUserByDiscordId(viewer.session.user.id);

  if (!user) {
    redirect("/");
  }

  const { page, status } = parseManagePostsSearchParams(rawSearchParams);
  const createdById = viewer.permissions.hasStaffRole ? undefined : user.id;
  const totalPosts = await getPostsCount([], createdById, status);
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;
  const [posts, autoApproveEnabled] = await Promise.all([
    getPosts(POSTS_PER_PAGE, offset, [], createdById, status),
    viewer.permissions.hasStaffRole
      ? shouldAutoApproveBotPosts()
      : Promise.resolve(false),
  ]);

  return (
    <ManageJobsClient
      autoApproveEnabled={autoApproveEnabled}
      initialPagination={{
        total: totalPosts,
        page: currentPage,
        limit: POSTS_PER_PAGE,
        pages: totalPages,
      }}
      initialPosts={serializePosts(posts)}
      initialStatusFilter={status || "all"}
      isStaff={viewer.permissions.hasStaffRole}
      session={viewer.session}
    />
  );
}
