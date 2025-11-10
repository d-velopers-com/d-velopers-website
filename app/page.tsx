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
import { getCountryFlagUrl, getCountryName } from "@/lib/countries";

interface PublicUser {
  handler: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  discordId: string;
  name: string | null;
  title: string | null;
  country: string | null;
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
    let isMounted = true;
    
    fetch("/api/users/public")
      .then((res) => {
        if (!isMounted) return;
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const usersData = data.users || [];
        setUsers(usersData);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen px-4 pt-6 pb-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-default-50/30 dark:to-default-100/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-0">
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
              <Card key={i} className="p-4 overflow-hidden">
                  <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="rounded-full w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-1">
                      <Skeleton className="rounded-lg w-3/4 h-5" />
                      <Skeleton className="rounded-lg w-full h-4" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-auto">
                    <Skeleton className="rounded-full w-16 h-6" />
                    <Skeleton className="rounded-full w-20 h-6" />
                    <Skeleton className="rounded-full w-14 h-6" />
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
                  className="relative overflow-hidden transition-all duration-200 hover:bg-default-200 dark:hover:bg-default-100/30 hover:shadow-lg hover:scale-[1.02]"
                >
                  <CardBody className="relative p-0 flex flex-col overflow-hidden">
                    <Link href={`/users/${user.handler}`} className="p-4 flex flex-col">
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Avatar
                            className="w-12 h-12 ring-2 ring-cyan/20"
                            src={avatarUrl}
                          />
                          {user.country && getCountryFlagUrl(user.country, "24") && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background bg-background flex items-center justify-center overflow-hidden shadow-sm">
                              <img
                                alt={getCountryName(user.country)}
                                className="w-full h-full object-cover rounded-full"
                                src={getCountryFlagUrl(user.country, "24")}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <h3 className="font-bold text-base leading-tight truncate">
                            {user.name || user.username}
                          </h3>
                          {user.title && (
                            <p className="text-xs text-default-600 line-clamp-2 overflow-hidden leading-relaxed">
                              {user.title}
                            </p>
                          )}
                        </div>
                      </div>
                      {displayTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {displayTags.map((tag) => (
                            <Chip
                              key={tag}
                              className="text-xs"
                              classNames={{
                                base: "bg-primary-100 dark:!bg-[#111111]",
                                content: "text-primary-800 dark:!text-[#00C8FF] font-semibold",
                              }}
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
