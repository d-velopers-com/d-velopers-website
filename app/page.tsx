"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";

interface PublicUser {
  handler: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  discordId: string;
  name: string | null;
  title: string | null;
  tags: string[];
  roles: string[];
  joinedServerAt: string | null;
  createdAt: string;
}

export default function Home() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { status } = useSession();

  useEffect(() => {
    fetch("/api/users/public")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-default-50/30 dark:to-default-100/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-12">
          <h1 className="text-5xl sm:text-6xl font-black mb-4 text-foreground">
            {t.home.title}
          </h1>
          <p className="text-xl text-default-600 max-w-2xl mx-auto mb-8">
            {t.home.subtitle}
          </p>
          {status === "unauthenticated" && (
            <div className="mt-8 flex justify-center">
              <Button
                as={Link}
                className="font-bold text-lg px-8 py-6"
                color="primary"
                href="/login"
                size="lg"
                variant="shadow"
              >
                {t.home.joinCommunity}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-[220px] p-6 overflow-hidden">
                <div className="flex flex-col gap-3 h-full">
                  <Skeleton className="rounded-full w-16 h-16 flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    <div className="space-y-2 mb-3">
                      <Skeleton className="rounded-lg w-3/4 h-5" />
                      <Skeleton className="rounded-lg w-1/2 h-4" />
                    </div>
                    <div className="flex gap-1.5 mt-auto">
                      <Skeleton className="rounded-full w-16 h-6" />
                      <Skeleton className="rounded-full w-20 h-6" />
                      <Skeleton className="rounded-full w-14 h-6" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-8xl mb-8">👥</div>
            <p className="text-default-400 text-xl mb-8">{t.home.noProfiles}</p>
            {status === "unauthenticated" && (
              <Button
                as={Link}
                className="mt-4 font-semibold"
                color="primary"
                href="/login"
                size="lg"
                variant="shadow"
              >
                {t.home.beFirst}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

              const displayTags = user.tags?.slice(0, 4) || [];
              const remainingTags = (user.tags?.length || 0) - 4;

              return (
                <Card
                  key={user.handler}
                  className="relative h-[220px] overflow-hidden transition-colors hover:bg-default-100 dark:hover:bg-default-50/10"
                >
                  <CardBody className="relative p-6 h-full flex flex-col overflow-hidden">
                    <Link href={`/users/${user.handler}`}>
                      <div className="flex flex-col gap-3 h-full">
                        <Avatar
                          className="w-16 h-16 flex-shrink-0 ring-2 ring-cyan/20"
                          src={avatarUrl}
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="font-bold text-lg mb-1 truncate">
                            {user.name || user.username}
                          </h3>
                          {user.title && (
                            <p className="text-sm text-default-600 mb-3 line-clamp-2 overflow-hidden">
                              {user.title}
                            </p>
                          )}
                          {displayTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                              {displayTags.map((tag) => (
                                <Chip
                                  key={tag}
                                  className="text-xs"
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                >
                                  {tag}
                                </Chip>
                              ))}
                              {remainingTags > 0 && (
                                <Chip
                                  className="text-xs"
                                  color="default"
                                  size="sm"
                                  variant="flat"
                                >
                                  +{remainingTags}
                                </Chip>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
