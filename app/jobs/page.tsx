import { PostStatus } from "@prisma/client";
import { Metadata } from "next";

import {
  buildPostSearchConditions,
  getPosts,
  getPostsCount,
} from "@/lib/posts";
import { parseJobsSearchParams } from "@/lib/search-params";
import { serializePublicJobPosts } from "@/lib/serializers";

import JobsClient from "./jobs-client";

const POSTS_PER_PAGE = 6;

export const metadata: Metadata = {
  title: "Jobs",
  description: "Curated job opportunities shared by the D-velopers community.",
  robots: { index: true, follow: true },
};

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const rawSearchParams = await searchParams;
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
      initialPosts={serializePublicJobPosts(posts)}
      initialSearch={search}
      totalPages={totalPages}
      totalPosts={totalPosts}
    />
  );
}
