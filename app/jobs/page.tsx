"use client";

import {useEffect, useState} from "react";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Skeleton} from "@heroui/skeleton";
import {useLanguage} from "@/contexts/language-context";

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
  const {t} = useLanguage();

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
  }, []);

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

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-8 w-3/4 mb-4 rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
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
