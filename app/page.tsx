"use client";

import { useEffect, useState, useRef } from "react";
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
  const [visibleTagsCount, setVisibleTagsCount] = useState<
    Record<string, number>
  >({});
  const tagsContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
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

  // Calcular cuántos chips caben en cada card
  useEffect(() => {
    const calculateVisibleTags = () => {
      const newVisibleTagsCount: Record<string, number> = {};

      Object.entries(tagsContainerRefs.current).forEach(
        ([handler, container]) => {
          if (!container) return;

          const user = users.find((u) => u.handler === handler);
          if (!user || !user.tags || user.tags.length === 0) return;

          const containerWidth = container.offsetWidth;
          // Ancho aproximado: chip pequeño (~60-80px) + gap (6px) + chip "+N" (~50px)
          const chipWidth = 70; // Ancho aproximado de un chip
          const plusChipWidth = 50; // Ancho del chip "+N"
          const gap = 6; // gap-1.5 = 6px

          // Calcular cuántos chips caben
          let availableWidth = containerWidth;
          let visibleCount = 0;

          // Siempre reservar espacio para el chip "+N" si hay más de 1 tag
          if (user.tags.length > 1) {
            availableWidth -= plusChipWidth + gap;
          }

          // Contar cuántos chips caben
          for (let i = 0; i < user.tags.length; i++) {
            if (availableWidth >= chipWidth) {
              availableWidth -= chipWidth + gap;
              visibleCount++;
            } else {
              break;
            }
          }

          // Si no cabe ninguno, mostrar al menos 1 y el "+N"
          if (visibleCount === 0 && user.tags.length > 0) {
            visibleCount = 1;
          }

          newVisibleTagsCount[handler] = visibleCount;
        },
      );

      setVisibleTagsCount(newVisibleTagsCount);
    };

    calculateVisibleTags();

    const handleResize = () => {
      calculateVisibleTags();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [users]);

  return (
    <div
      className={`min-h-screen px-4 pt-6 pb-12 sm:px-6 lg:px-8 ${gradients.background}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 mt-0 min-h-[120px]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1
            className={`${typography.h1} mb-4 text-foreground min-h-[2.5rem]`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {t.home.title}
          </motion.h1>
          <motion.p
            className={`${typography.bodyLarge} max-w-2xl mx-auto mb-8 min-h-[1.5rem]`}
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

              const allTags = user.tags || [];
              const visibleCount =
                visibleTagsCount[user.handler] ?? allTags.length;
              const displayTags = allTags.slice(0, visibleCount);
              const remainingTags =
                allTags.length > visibleCount
                  ? allTags.length - visibleCount
                  : 0;

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
                    className={`relative overflow-hidden ${cardStyles.base} ${cardStyles.hover} h-full flex flex-col h-[140px]`}
                  >
                    <CardBody className="relative p-0 flex flex-col overflow-hidden h-full">
                      <Link
                        href={`/users/${user.handler}`}
                        className="p-4 flex flex-col h-full"
                      >
                        <div className="flex items-start gap-3 flex-shrink-0 mb-2">
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
                            className={`flex-1 min-w-0 flex flex-col gap-1 overflow-hidden`}
                          >
                            <h3
                              className={`${typography.h3} leading-tight truncate flex-shrink-0`}
                            >
                              {user.name || user.username}
                            </h3>
                            <p
                              className={`${typography.caption} truncate overflow-hidden text-ellipsis leading-tight`}
                              title={user.title || ""}
                            >
                              {user.title || "\u00A0"}
                            </p>
                          </div>
                        </div>
                        <div
                          ref={(el) => {
                            tagsContainerRefs.current[user.handler] = el;
                          }}
                          className={`flex flex-nowrap gap-1.5 overflow-hidden mt-auto`}
                        >
                          {displayTags.map((tag) => (
                            <Chip
                              key={tag}
                              className={`${chipStyles.base} flex-shrink-0`}
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
                              className={`${chipStyles.base} flex-shrink-0`}
                              color="default"
                              size="sm"
                              variant="flat"
                            >
                              +{remainingTags}
                            </Chip>
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
