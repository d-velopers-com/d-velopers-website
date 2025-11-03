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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="rounded-full w-28 h-28" />
                  <Skeleton className="rounded-lg w-32 h-6" />
                  <Skeleton className="rounded-lg w-full h-3" />
                  <Skeleton className="rounded-lg w-5/6 h-3" />
                  <Skeleton className="rounded-lg w-4/6 h-3 mb-2" />
                  <Skeleton className="rounded-lg w-full h-9" />
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

              return (
                <Card
                  key={user.handler}
                  className="group relative h-full overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
                >
                  <CardBody className="relative p-6">
                    <Link href={`/users/${user.handler}`}>
                      <div className="flex flex-col items-center text-center gap-4 mb-6 cursor-pointer">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan to-info rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
                          <Avatar
                            className="w-28 h-28 text-large relative z-10 ring-4 ring-cyan/20 group-hover:ring-cyan/60 group-hover:ring-offset-4 group-hover:ring-offset-background transition-all duration-500 group-hover:scale-110"
                            src={avatarUrl}
                          />
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-cyan to-info rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            ✨
                          </div>
                        </div>

                        <div className="w-full">
                          <h3 className="font-bold text-xl mb-2 transition-all duration-300">
                            {user.username}
                          </h3>
                          {user.description ? (
                            <p className="text-sm text-default-600 line-clamp-3 leading-relaxed px-2">
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

                    <div className="flex gap-2">
                      <Button
                        as={Link}
                        className="flex-1 font-semibold bg-gradient-to-r from-info to-cyan text-white shadow-lg hover:shadow-info/50 hover:scale-105 transition-all duration-300"
                        href={`/users/${user.handler}`}
                        size="sm"
                      >
                        Ver Perfil
                      </Button>
                      {user.link && (
                        <Button
                          isIconOnly
                          as="a"
                          className="font-medium bg-gradient-to-br from-cyan/20 to-info/20 text-cyan border-2 border-cyan/30 hover:border-cyan hover:bg-gradient-to-br hover:from-cyan hover:to-info hover:text-white hover:scale-110 hover:rotate-12 transition-all duration-300"
                          href={user.link}
                          rel="noopener noreferrer"
                          size="sm"
                          target="_blank"
                        >
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
