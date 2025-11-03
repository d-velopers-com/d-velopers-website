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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16 mt-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.home.subtitle}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="rounded-full w-36 h-36 mx-auto mb-6" />
                <Skeleton className="rounded-lg w-full h-3 mb-2" />
                <Skeleton className="rounded-lg w-5/6 h-3 mx-auto mb-2" />
                <Skeleton className="rounded-lg w-4/6 h-3 mx-auto mb-6" />
                <Skeleton className="rounded-full w-32 h-10 mx-auto" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => {
              const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

              return (
                <Link key={user.handler} href={`/users/${user.handler}`}>
                  <Card
                    isPressable
                    className="group h-full transition-all duration-300 hover:shadow-lg"
                  >
                    <CardBody className="flex flex-col items-center text-center p-6 gap-4">
                      <Avatar
                        className="w-32 h-32 text-large transition-transform duration-300 group-hover:scale-105"
                        src={avatarUrl}
                      />

                      <h3 className="font-semibold text-lg mt-2">
                        {user.username}
                      </h3>

                      {user.description ? (
                        <p className="text-sm text-default-500 line-clamp-3 leading-relaxed min-h-[3.75rem]">
                          {user.description}
                        </p>
                      ) : (
                        <p className="text-sm text-default-400 italic min-h-[3.75rem] flex items-center justify-center">
                          Sin descripción
                        </p>
                      )}

                      {user.link && (
                        <Button
                          as="a"
                          className="w-full font-medium"
                          color="default"
                          href={user.link}
                          rel="noopener noreferrer"
                          size="sm"
                          startContent={
                            <svg
                              className="w-4 h-4"
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
                          variant="bordered"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver más
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
