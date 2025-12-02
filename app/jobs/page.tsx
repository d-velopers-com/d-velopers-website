"use client";

import {useEffect, useState, useCallback} from "react";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Avatar} from "@heroui/avatar";
import {Pagination} from "@heroui/pagination";
import {useLanguage} from "@/contexts/language-context";
import {useSession} from "@/hooks/useSession";
import {useRouter} from "next/navigation";
import {useProfile} from "@/hooks/useProfile";
import {SkeletonLoading} from "@/components/skeleton-loading";
import {validateRecentActivation} from "@/lib/utils";
import {typography} from "@/lib/ui-constants";

interface PostAuthor {
  id: string;
  username: string;
  avatar: string | null;
}

interface Post {
  id: string;
  title: string;
  iframe: string;
  createdBy?: PostAuthor | null;
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

export default function JobsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [enableView, setViewEnable] = useState<boolean | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {t} = useLanguage();
  const {data: session, status} = useSession();
  const router = useRouter();
  const {profile} = useProfile();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.roles) {
      return;
    }

    const hasRecentActivation = validateRecentActivation(profile?.profileActivatedAt);
    fetch("/api/config/allowed-roles")
      .then((res) => res.json())
      .then((data) => {
        const backRoles = data.roles || [];
        const hasRole = session?.user?.roles?.some((role) => backRoles.includes(role)) || false;
        const isServerMember = session?.user?.roles && session?.user.roles.length > 0 || false;
        const hasAllowedRole = isServerMember && hasRole;
        const canApplyTrialPeriod = isServerMember && !hasAllowedRole && !profile?.profileActivatedAt;
        const canMakePublic = hasAllowedRole || hasRecentActivation || canApplyTrialPeriod;
        setViewEnable(canMakePublic);
      })
      .catch(() => setViewEnable(false))
      .finally(() => setIsLoading(false));
  }, [session, status, profile]);

  const fetchPosts = useCallback(async (page: number) => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}`);
      const data: PostsResponse = await res.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoadingPosts(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enableView) {
      fetchPosts(currentPage);
    }
  }, [enableView, currentPage, fetchPosts]);

  useEffect(() => {
    if (enableView === false) {
      router.push('/');
    }
  }, [enableView, router]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show skeleton during SSR and initial client render to prevent hydration mismatch
  if (!isMounted || isLoading || !enableView) {
    return <SkeletonLoading/>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8">
      <div className="max-w-7xl w-full space-y-8">
        <Card>
          <CardHeader className="flex flex-col justify-center px-6 py-4">
            <h1 className="text-3xl font-bold">
              {t.jobs.title}
            </h1>
            <p className="text-default-500 text-sm mt-1 text-center">
              {t.jobs.subtitle}
            </p>
          </CardHeader>
        </Card>

        {isLoadingPosts ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(POSTS_PER_PAGE)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardHeader className="flex flex-row items-center gap-3 px-4 py-3 bg-default-50">
                  <div className="w-8 h-8 rounded-full bg-default-200" />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="h-4 w-32 bg-default-200 rounded" />
                    <div className="h-3 w-24 bg-default-200 rounded" />
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-64 bg-default-100 rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-default-500 py-8">
                {t.jobs.noPosts}
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-3 px-4 py-3 bg-default-50">
                    {post.createdBy && (
                      <Avatar
                        size="sm"
                        src={post.createdBy.avatar 
                          ? `https://cdn.discordapp.com/avatars/${post.createdBy.id}/${post.createdBy.avatar}.png`
                          : undefined
                        }
                        name={post.createdBy.username}
                      />
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`${typography.label} truncate`}>{post.title}</span>
                      <div className="flex items-center gap-2">
                        {post.createdBy && (
                          <span className={`${typography.caption} text-default-400`}>
                            {t.jobs.postedBy} {post.createdBy.username}
                          </span>
                        )}
                        <span className={`${typography.caption} text-default-400`}>
                          • {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0 flex justify-center items-center overflow-hidden">
                    <div 
                      className="w-full flex justify-center"
                      dangerouslySetInnerHTML={{__html: post.iframe}}
                    />
                  </CardBody>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  showControls
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
