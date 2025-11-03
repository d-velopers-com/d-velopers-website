"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { useLanguage } from "@/contexts/language-context";

interface User {
  username: string;
  discriminator: string | null;
  handler: string;
  avatar: string | null;
  discordId: string;
  description: string | null;
  link: string | null;
  joinedServerAt: string | null;
}

export default function ProfilePage() {
  const params = useParams();
  const handler = params.handler as string;
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    fetch(`/api/users/handler/${handler}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFoundError(true);

          return null;
        }

        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
        }

        setLoading(false);
      })
      .catch(() => {
        setNotFoundError(true);
        setLoading(false);
      });
  }, [handler]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Card className="max-w-2xl w-full shadow-lg border-1 border-default-200">
          <CardBody className="p-0">
            <Skeleton className="h-32 w-full rounded-t-lg" />
            <div className="relative px-6 pb-6">
              <div className="flex flex-col items-center -mt-12 mb-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="w-32 h-6 mt-4 rounded-lg" />
                <Skeleton className="w-24 h-4 mt-2 rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (notFoundError || !user) {
    notFound();
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="max-w-2xl w-full shadow-lg border-1 border-default-200">
        <CardBody className="p-0">
          <div className="relative bg-info h-32 rounded-t-lg" />

          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-12 mb-4">
              <Avatar
                className="w-24 h-24 border-4 border-background shadow-lg ring-2 ring-info/30"
                src={avatarUrl}
              />

              <h1 className="text-2xl font-bold mt-4 mb-1 text-foreground">
                {user.username}
              </h1>
              <p className="text-default-500 text-sm font-medium">
                @{user.handler}
              </p>
              {user.joinedServerAt && (
                <div className="flex items-center gap-2 mt-2 text-xs text-default-400">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>
                    {t.common.memberSince}{" "}
                    {new Date(user.joinedServerAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              )}
            </div>

            {user.description && (
              <div className="mb-4 bg-default-50/50 dark:bg-default-100/10 rounded-lg p-4 border border-default-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="text-xs font-bold text-default-700">
                    About
                  </span>
                </div>
                <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                  {user.description}
                </p>
              </div>
            )}

            {user.link && (
              <div className="mb-4">
                <Button
                  fullWidth
                  as="a"
                  className="font-medium text-sm"
                  color="primary"
                  href={user.link}
                  rel="noopener noreferrer"
                  size="sm"
                  startContent={
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  }
                  target="_blank"
                  variant="flat"
                >
                  Visit Website
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
