"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { useLanguage } from "@/contexts/language-context";
import { getCountryName, getCountryFlagUrl } from "@/lib/countries";
import { detectSocialPlatform } from "@/lib/url-detector";
import {
  LinkedInIcon,
  GithubIcon,
  TwitterIcon,
  YouTubeIcon,
  InstagramIcon,
  DiscordIcon,
} from "@/components/icons";

interface User {
  username: string;
  discriminator: string | null;
  handler: string;
  avatar: string | null;
  discordId: string;
  description: string | null;
  link: string | null;
  contactLinks: string[];
  contactEmail: string | null;
  country: string | null;
  name: string | null;
  title: string | null;
  tags: string[];
  englishLevel: string | null;
  availability: string[];
  joinedServerAt: string | null;
}

export default function ProfilePage() {
  const params = useParams();
  const handler = params.handler as string;
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailButtonPressed, setEmailButtonPressed] = useState(false);

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

  const handleCopyEmail = () => {
    if (user.contactEmail) {
      navigator.clipboard.writeText(user.contactEmail);
      setEmailCopied(true);
      setEmailButtonPressed(true);
      setTimeout(() => {
        setEmailCopied(false);
        setEmailButtonPressed(false);
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="max-w-3xl w-full shadow-lg border-1 border-default-200">
        <CardBody className="p-0">
          <div className="relative bg-gradient-to-r from-primary-500 to-info-500 h-40 rounded-t-lg" />

          <div className="relative px-8 pb-8">
            <div className="flex items-start gap-6 -mt-16 mb-6">
              <Avatar
                className="w-28 h-28 border-4 border-background shadow-xl ring-4 ring-primary/20 flex-shrink-0"
                src={avatarUrl}
              />

              <div className="flex-1 pt-20">
                <div className="flex flex-col gap-2 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.name || user.username}
                  </h1>
                  {user.title && (
                    <p className="text-lg text-default-600 font-medium">
                      {user.title}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-default-500">
                  {user.country && (
                    <div className="flex items-center gap-2">
                      <img
                        alt={getCountryName(user.country)}
                        className="w-5 h-4 rounded object-cover"
                        src={getCountryFlagUrl(user.country, "24")}
                      />
                      <span>{getCountryName(user.country)}</span>
                    </div>
                  )}
                  {user.englishLevel && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      <span>
                        {t.profile.english}: {user.englishLevel}
                      </span>
                    </div>
                  )}
                  {user.availability &&
                    Array.isArray(user.availability) &&
                    user.availability.length > 0 && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-default-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-default-600">
                            {t.profile.availability}:
                          </span>
                          {user.availability.map((avail) => {
                            let label = "";
                            switch (avail) {
                              case "freelance":
                                label = t.profile.availabilityFreelance;
                                break;
                              case "part_time":
                                label = t.profile.availabilityPartTime;
                                break;
                              case "full_time":
                                label = t.profile.availabilityFullTime;
                                break;
                              case "consulting":
                                label = t.profile.availabilityConsulting;
                                break;
                              case "not_available":
                                label = t.profile.availabilityNotAvailable;
                                break;
                              default:
                                label = avail;
                            }
                            return (
                              <Chip
                                key={avail}
                                classNames={{
                                  base: "bg-default-100 dark:!bg-[#1a1a1a]",
                                  content:
                                    "text-default-700 dark:!text-default-300 text-xs font-medium",
                                }}
                                size="sm"
                                variant="flat"
                              >
                                {label}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {user.description && (
              <div className="mb-6 bg-default-50/50 dark:bg-default-100/10 rounded-lg p-5 border border-default-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-primary"
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
                  <span className="text-sm font-semibold text-default-700">
                    {t.profile.about}
                  </span>
                </div>
                <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                  {user.description}
                </p>
              </div>
            )}

            {user.tags && user.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {user.tags.map((tag) => (
                    <Chip
                      key={tag}
                      classNames={{
                        base: "bg-primary-100 dark:!bg-[#111111]",
                        content:
                          "text-primary-800 dark:!text-[#00C8FF] font-semibold",
                      }}
                      color="primary"
                      size="md"
                      variant="flat"
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {user.contactEmail && (
                <div
                  className="flex items-center gap-3 bg-default-50/50 dark:bg-default-100/10 rounded-lg p-4 border border-default-200/50 cursor-pointer transition-all duration-200 hover:bg-default-100/70 dark:hover:bg-default-100/20 hover:border-default-300/50 active:scale-[0.98]"
                  onClick={handleCopyEmail}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCopyEmail();
                    }
                  }}
                >
                  <svg
                    className="w-5 h-5 text-default-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="flex-1 text-sm text-default-600 font-medium">
                    {user.contactEmail}
                  </span>
                  <Button
                    className={`min-w-fit pointer-events-none transition-transform duration-150 ${emailButtonPressed ? "scale-95" : ""}`}
                    color={emailCopied ? "success" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {emailCopied ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              )}

              {user.link && (
                <Button
                  fullWidth
                  as="a"
                  className="font-medium"
                  color="default"
                  href={user.link}
                  rel="noopener noreferrer"
                  size="md"
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
                  variant="flat"
                >
                  {t.profile.visitWebsite}
                </Button>
              )}

              {user.contactLinks &&
                user.contactLinks.length > 0 &&
                user.contactLinks[0] &&
                (() => {
                  const contactLink = user.contactLinks[0];
                  const platform = detectSocialPlatform(contactLink);

                  const getButtonText = () => {
                    switch (platform) {
                      case "linkedin":
                        return t.profile.myLinkedIn;
                      case "github":
                        return t.profile.myGitHub;
                      case "x":
                        return t.profile.myX;
                      case "youtube":
                        return t.profile.myYouTube;
                      case "instagram":
                        return t.profile.myInstagram;
                      case "discord":
                        return t.profile.myDiscord;
                      case "facebook":
                        return t.profile.myFacebook;
                      case "tiktok":
                        return t.profile.myTikTok;
                      case "twitch":
                        return t.profile.myTwitch;
                      case "reddit":
                        return t.profile.myReddit;
                      case "telegram":
                        return t.profile.myTelegram;
                      case "whatsapp":
                        return t.profile.myWhatsApp;
                      case "spotify":
                        return t.profile.mySpotify;
                      case "medium":
                        return t.profile.myMedium;
                      case "behance":
                        return t.profile.myBehance;
                      case "dribbble":
                        return t.profile.myDribbble;
                      default:
                        return t.profile.socialLink;
                    }
                  };

                  const getIcon = () => {
                    switch (platform) {
                      case "linkedin":
                        return <LinkedInIcon size={16} />;
                      case "github":
                        return <GithubIcon size={16} />;
                      case "x":
                        return <TwitterIcon size={16} />;
                      case "youtube":
                        return <YouTubeIcon size={16} />;
                      case "instagram":
                        return <InstagramIcon size={16} />;
                      case "discord":
                        return <DiscordIcon size={16} />;
                      default:
                        return (
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
                        );
                    }
                  };

                  return (
                    <Button
                      fullWidth
                      as="a"
                      className="font-medium"
                      color="default"
                      href={contactLink}
                      rel="noopener noreferrer"
                      size="md"
                      startContent={getIcon()}
                      target="_blank"
                      variant="flat"
                    >
                      {getButtonText()}
                    </Button>
                  );
                })()}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
