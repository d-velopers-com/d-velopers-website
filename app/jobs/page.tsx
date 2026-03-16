import { PostStatus } from "@prisma/client";

import JobsClient from "./jobs-client";

import {
  buildPostSearchConditions,
  getPosts,
  getPostsCount,
} from "@/lib/posts";
import { parseJobsSearchParams } from "@/lib/search-params";
import { serializePosts } from "@/lib/serializers";
import { getViewerContext } from "@/lib/viewer";

const POSTS_PER_PAGE = 6;

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const [viewer, rawSearchParams] = await Promise.all([
    getViewerContext(),
    searchParams,
  ]);

  const { page, search } = parseJobsSearchParams(rawSearchParams);
  const searchConditions = buildPostSearchConditions(search);
  const totalPosts = await getPostsCount(
    searchConditions,
    undefined,
    PostStatus.APPROVED,
  );
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;
  const posts = await getPosts(
    POSTS_PER_PAGE,
    offset,
    searchConditions,
    undefined,
    PostStatus.APPROVED,
  );

  return (
    <JobsClient
      currentPage={currentPage}
      initialPosts={serializePosts(posts)}
      initialSearch={search}
      totalPages={totalPages}
      totalPosts={totalPosts}
    />
  );
}
