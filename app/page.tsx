"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { getCountryFlagUrl, getCountryName } from "@/lib/countries";
import {
  cardStyles,
  typography,
  chipStyles,
  avatarStyles,
  gradients,
  spacing,
  focusStates,
  borderRadius,
} from "@/lib/ui-constants";

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
    <div
      className={`min-h-screen px-4 pt-6 pb-12 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 mt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1
            className={`${typography.h1} mb-4 text-foreground`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {t.home.title}
          </motion.h1>
          <motion.p
            className={`${typography.bodyLarge} max-w-2xl mx-auto mb-8`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            {t.home.subtitle}
          </motion.p>
          {status === "unauthenticated" && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                as={Link}
                className={`${typography.buttonLg} px-8 py-6 ${focusStates.button}`}
                color="primary"
                href="/login"
                size="lg"
                variant="shadow"
              >
                {t.home.joinCommunity}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className={`p-4 overflow-hidden ${cardStyles.base}`}
              >
                <div className={`flex flex-col ${spacing.md}`}>
                  <div className={`flex items-start ${spacing.md}`}>
                    <Skeleton className="rounded-lg w-12 h-12 flex-shrink-0 shimmer" />
                    <div className={`flex-1 flex flex-col ${spacing.sm}`}>
                      <Skeleton className="rounded-lg w-3/4 h-5 shimmer" />
                      <Skeleton className="rounded-lg w-full h-4 shimmer" />
                    </div>
                  </div>
                  <div className={`flex ${spacing.sm} mt-auto`}>
                    <Skeleton className="rounded-lg w-16 h-6 shimmer" />
                    <Skeleton className="rounded-lg w-20 h-6 shimmer" />
                    <Skeleton className="rounded-lg w-14 h-6 shimmer" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <motion.div
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="text-8xl mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              👥
            </motion.div>
            <motion.p
              className={`text-default-400 ${typography.bodyLarge} mb-8`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              {t.home.noProfiles}
            </motion.p>
            {status === "unauthenticated" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                <Button
                  as={Link}
                  className={`mt-4 ${typography.button} ${focusStates.button}`}
                  color="primary"
                  href="/login"
                  size="lg"
                  variant="shadow"
                >
                  {t.home.beFirst}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {users.map((user) => {
              const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

              const displayTags = user.tags?.slice(0, 4) || [];
              const remainingTags = (user.tags?.length || 0) - 4;

              return (
                <motion.div
                  key={user.handler}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.4,
                        ease: "easeOut",
                      },
                    },
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`relative overflow-hidden ${cardStyles.base} ${cardStyles.hover} h-full flex flex-col min-h-[200px]`}
                  >
                    <CardBody className="relative p-0 flex flex-col overflow-hidden h-full">
                      <Link
                        href={`/users/${user.handler}`}
                        className="p-4 flex flex-col h-full"
                      >
                        <div className="flex items-start gap-3 flex-shrink-0 mb-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Avatar
                              className={`w-12 h-12 ${avatarStyles.ring}`}
                              src={avatarUrl}
                            />
                            {user.country &&
                              getCountryFlagUrl(user.country, "24") && (
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${borderRadius.outer.full} border-2 border-background bg-background flex items-center justify-center overflow-hidden shadow-sm`}
                                >
                                  <img
                                    alt={getCountryName(user.country)}
                                    className="w-full h-full object-cover rounded-full"
                                    src={getCountryFlagUrl(user.country, "24")}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}
                          </div>
                          <div
                            className={`flex-1 min-w-0 flex flex-col ${spacing.sm} overflow-hidden`}
                          >
                            <h3
                              className={`${typography.h3} leading-tight truncate flex-shrink-0 min-h-[1.5rem]`}
                            >
                              {user.name || user.username}
                            </h3>
                            <p
                              className={`${typography.caption} line-clamp-2 overflow-hidden text-ellipsis leading-relaxed min-h-[2.5rem]`}
                              title={user.title || ""}
                            >
                              {user.title || "\u00A0"}
                            </p>
                          </div>
                        </div>
                        <div className={`flex flex-wrap ${spacing.sm} mt-auto`}>
                          {displayTags.length > 0 ? (
                            <>
                              {displayTags.map((tag) => (
                                <Chip
                                  key={tag}
                                  className={chipStyles.base}
                                  classNames={chipStyles.classNames}
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                >
                                  {tag}
                                </Chip>
                              ))}
                              {remainingTags > 0 && (
                                <Chip
                                  className={chipStyles.base}
                                  color="default"
                                  size="sm"
                                  variant="flat"
                                >
                                  +{remainingTags}
                                </Chip>
                              )}
                            </>
                          ) : (
                            <div className="min-h-[1.5rem]" />
                          )}
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
