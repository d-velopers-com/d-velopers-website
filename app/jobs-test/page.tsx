"use client";

import {useEffect, useState, useCallback, useMemo, memo} from "react";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Pagination} from "@heroui/pagination";
import {Input} from "@heroui/input";
import {Chip} from "@heroui/chip";
import {Button} from "@heroui/button";
import {useRouter} from "next/navigation";
import {useLanguage} from "@/contexts/language-context";
import {useSession} from "@/hooks/useSession";
import {useProfile} from "@/hooks/useProfile";
import {SkeletonLoading} from "@/components/skeleton-loading";
import {validateRecentActivation, debounce} from "@/lib/utils";
import {typography, cardStyles} from "@/lib/ui-constants";
import {SearchIcon} from "@/components/icons";
import {GenericEmbed} from "@/app/jobs/genericEmbed";
import {JobCardSkeleton} from "@/app/jobs/jobCardSkeleton";
import {EmptyState} from "@/app/jobs/emptyState";
import {PageHeader} from "@/app/jobs/pageHeader";

interface Post {
  id: string;
  title: string;
  iframe: string;
  sourceUrl?: string | null;
  embeddable: boolean;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PostsResponse {
  posts: Post[];
  pagination: PaginationData;
}

const POSTS_PER_PAGE = 6;

/**
 * LinkedIn Embed component - shows embed or fallback based on server-side embeddable check
 */
const LinkedInEmbed = memo(function LinkedInEmbed(
  {
    iframeHtml,
    sourceUrl,
    translations,
  }: {
    iframeHtml: string;
    sourceUrl: string;
    translations: {
      cannotBeEmbedded: string;
      openInLinkedIn: string;
    };
  }) {
  const [iframeError, setIframeError] = useState(false);

  // Extract src from iframe HTML
  const iframeSrc = useMemo(() => {
    const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : null;

    // Only return valid LinkedIn embed URLs, not placeholders like "about:blank"
    if (src && src.includes("linkedin.com/embed")) {
      return src;
    }

    return null;
  }, [iframeHtml]);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
  }, []);

  if (iframeError || !iframeSrc) {
    return (
      <div className="w-full px-5 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-[#0A66C2]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <p className="text-default-500 text-sm text-center">
            {translations.cannotBeEmbedded}
          </p>
          <a
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            href={sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {translations.openInLinkedIn}
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex justify-center">
      <iframe
        allowFullScreen
        className="max-w-full"
        frameBorder="0"
        height="600"
        src={iframeSrc}
        title="LinkedIn Post"
        width="504"
        onError={handleIframeError}
      />
    </div>
  );
});

/**
 * Individual job post card with embed fallback
 */
const JobCard = memo(function JobCard(
  {
    post,
    embedTranslations,
  }: {
    post: Post;
    embedTranslations: {
      cannotBeEmbedded: string;
      openInLinkedIn: string;
      openInSite: string;
    };
  }) {
  // Use static date format to avoid hydration mismatch
  const formattedDate = useMemo(() => {
    const date = new Date(post.createdAt);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [post.createdAt]);

  // Detect platform
  const platform = useMemo(() => {
    const url = (post.sourceUrl || "").toLowerCase();

    if (url.includes("linkedin.com")) return "linkedin";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";

    return "unknown";
  }, [post.sourceUrl]);

  return (
    <Card className={`overflow-hidden ${cardStyles.base}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4 border-b border-default-200">
        <h3
          className={`${typography.label} text-foreground font-semibold truncate flex-1`}
        >
          {post.title}
        </h3>
        <Chip
          className="text-xs font-medium flex-shrink-0"
          color="default"
          size="sm"
          variant="flat"
        >
          {formattedDate}
        </Chip>
      </CardHeader>
      <CardBody className="p-0 flex flex-col justify-center items-center overflow-hidden bg-default-50">
        {platform === "linkedin" && post.sourceUrl ? (
          <LinkedInEmbed
            iframeHtml={post.iframe}
            sourceUrl={post.sourceUrl}
            translations={{
              cannotBeEmbedded: embedTranslations.cannotBeEmbedded,
              openInLinkedIn: embedTranslations.openInLinkedIn,
            }}
          />
        ) : post.sourceUrl ? (
          <GenericEmbed
            embeddable={post.embeddable}
            iframeHtml={post.iframe}
            sourceUrl={post.sourceUrl}
            translations={{
              cannotBeEmbedded: embedTranslations.cannotBeEmbedded,
              openInSite: embedTranslations.openInSite,
            }}
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{__html: post.iframe}}
            className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-none"
          />
        )}
      </CardBody>
    </Card>
  );
});


// ============================================================================
// Main Component
// ============================================================================

export default function JobsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [enableView, setViewEnable] = useState<boolean | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const {t} = useLanguage();
  const {data: session, status} = useSession();
  const router = useRouter();
  const {profile} = useProfile();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check if user can view jobs
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.roles) {
      return;
    }

    const hasRecentActivation = validateRecentActivation(
      profile?.profileActivatedAt,
    );

    fetch("/api/config/allowed-roles")
      .then((res) => res.json())
      .then((data) => {
        const backRoles = data.roles || [];
        const hasRole =
          session?.user?.roles?.some((role) => backRoles.includes(role)) ||
          false;
        const isServerMember = (session?.user?.roles?.length ?? 0) > 0;
        const hasAllowedRole = isServerMember && hasRole;
        const canApplyTrialPeriod =
          isServerMember && !hasAllowedRole && !profile?.profileActivatedAt;
        const canMakePublic =
          hasAllowedRole || hasRecentActivation || canApplyTrialPeriod;

        setViewEnable(canMakePublic);
      })
      .catch(() => setViewEnable(false))
      .finally(() => setIsLoading(false));
  }, [session, status, profile]);

  // Fetch posts function
  const fetchPosts = useCallback(async (page: number, searchQuery: string) => {
    setIsLoadingPosts(true);
    try {
      const params = new URLSearchParams();

      params.append("page", page.toString());
      params.append("limit", POSTS_PER_PAGE.toString());
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data: PostsResponse = await res.json();

      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
      setTotalPosts(data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedFetch = useMemo(
    () =>
      debounce(
        (page: number, searchQuery: string) => fetchPosts(page, searchQuery),
        400,
      ),
    [fetchPosts],
  );

  // Fetch on search change
  useEffect(() => {
    if (enableView) {
      setCurrentPage(1);
      debouncedFetch(1, search);
    }
  }, [enableView, search, debouncedFetch]);

  // Fetch on page change (not triggered by search which resets to page 1)
  useEffect(() => {
    if (enableView && isMounted) {
      fetchPosts(currentPage, search);
    }
  }, [currentPage]);

  // Redirect if not authorized
  useEffect(() => {
    if (enableView === false) {
      router.push("/");
    }
  }, [enableView, router]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({top: 0, behavior: "smooth"});
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  // Loading state
  if (!isMounted || isLoading || enableView === undefined) {
    return <SkeletonLoading/>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl w-full space-y-6">
        {/* Header */}
        <PageHeader
          subtitle={t.jobs.subtitle}
          title={t.jobs.title}
          totalPosts={totalPosts}
        />

        {/* Search Bar */}
        <div className="relative">
          <Input
            aria-label={t.jobs.searcher}
            classNames={{
              base: "w-full",
              inputWrapper: `bg-default-100/50 dark:bg-default-50/50 backdrop-blur-md border border-default-200 h-14 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
                search ? "pr-10" : ""
              }`,
              input: "text-base placeholder:text-default-400",
            }}
            endContent={
              search && (
                <Button
                  isIconOnly
                  className="absolute right-2"
                  size="sm"
                  variant="light"
                  onPress={handleClearSearch}
                >
                  <svg
                    className="w-4 h-4 text-default-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </Button>
              )
            }
            placeholder={t.jobs.searcher}
            startContent={
              <SearchIcon
                className="text-default-400 flex-shrink-0"
                size={20}
              />
            }
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoadingPosts ? (
          <div className="grid grGenericEmbedid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(POSTS_PER_PAGE)].map((_, i) => (
              <JobCardSkeleton key={i}/>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState message={t.jobs.noPosts}/>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post) => (
                <JobCard
                  key={post.id}
                  embedTranslations={{
                    cannotBeEmbedded:
                      t.jobs.embed?.cannotBeEmbedded ||
                      "This post cannot be embedded",
                    openInLinkedIn:
                      t.jobs.embed?.openInLinkedIn || "Open in LinkedIn",
                    openInSite: t.jobs.embed?.openInSite || "Open site",
                  }}
                  post={post}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-4 pb-8">
                <Pagination
                  showControls
                  className="gap-2"
                  color="primary"
                  page={currentPage}
                  size="lg"
                  total={totalPages}
                  variant="flat"
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
