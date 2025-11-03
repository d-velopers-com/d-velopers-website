"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";

interface PublicUser {
  handler: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  discordId: string;
  description: string | null;
  link: string | null;
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
          <p className="text-xl text-default-600 max-w-2xl mx-auto">
            {t.home.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="rounded-full w-24 h-24 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="rounded-lg w-32 h-6" />
                    <Skeleton className="rounded-lg w-full h-3" />
                    <Skeleton className="rounded-lg w-5/6 h-3" />
                    <Skeleton className="rounded-lg w-4/6 h-3" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user) => {
              const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

              return (
                <Card
                  key={user.handler}
                  className="group h-full transition-all duration-300 hover:shadow-xl"
                >
                  <CardBody className="p-6">
                    <Link href={`/users/${user.handler}`}>
                      <div className="flex gap-6 mb-6 cursor-pointer">
                        <Avatar
                          className="w-24 h-24 text-large flex-shrink-0 ring-2 ring-cyan/20 group-hover:ring-cyan transition-all duration-300"
                          src={avatarUrl}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-2xl mb-2 group-hover:text-cyan transition-colors">
                            {user.username}
                          </h3>
                          {user.description ? (
                            <p className="text-sm text-default-600 line-clamp-3 leading-relaxed">
                              {user.description}
                            </p>
                          ) : (
                            <p className="text-sm text-default-400 italic">
                              Sin descripción
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="flex gap-3">
                      <Button
                        as={Link}
                        className="flex-1 font-semibold bg-info text-white hover:bg-info/90"
                        href={`/users/${user.handler}`}
                        size="md"
                        variant="shadow"
                      >
                        View Profile
                      </Button>
                      {user.link && (
                        <Button
                          isIconOnly
                          as="a"
                          className="font-medium bg-cyan/10 text-cyan border-cyan/30 hover:bg-cyan hover:text-white"
                          href={user.link}
                          rel="noopener noreferrer"
                          size="md"
                          target="_blank"
                          variant="bordered"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </Button>
                      )}
                    </div>
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
