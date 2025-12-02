"use client";

import {useEffect, useState} from "react";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {useLanguage} from "@/contexts/language-context";
import {useSession} from "@/hooks/useSession";
import {useRouter} from "next/navigation";
import {useProfile} from "@/hooks/useProfile";
import {SkeletonLoading} from "@/components/skeleton-loading";
import {validateRecentActivation} from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  iframe: string;
  createdAt: string;
}

interface PostsResponse {
  posts: Post[];
}

export default function JobsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enableView, setViewEnable] = useState<boolean | undefined>(undefined);
  const {t} = useLanguage();
  const {data: session, status} = useSession();
  const router = useRouter();
  const {profile} = useProfile();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user?.roles) {
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
  }, [session, status === "authenticated", profile]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts?limit=100");
        const data: PostsResponse = await res.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [enableView]);

  useEffect(() => {
    if (enableView === false) {
      router.push('/');
    }
  }, [enableView, router]);

  if (isLoading || !enableView) {
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

        {posts.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-default-500 py-8">
                {t.jobs.noPosts}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="w-full flex justify-center items-center"
                dangerouslySetInnerHTML={{__html: post.iframe}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
