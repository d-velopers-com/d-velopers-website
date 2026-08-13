"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useState } from "react";

import {
  DiscordIcon,
  GithubIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@/components/icons";
import { useLanguage } from "@/contexts/language-context";
import { getCountryFlagUrl, getCountryName } from "@/lib/countries";
import {
  cardStyles,
  chipStyles,
  gradients,
  typography,
} from "@/lib/ui-constants";
import { detectSocialPlatform } from "@/lib/url-detector";
import { getDiscordAvatarUrl } from "@/shared/lib";

interface ProfileClientProps {
  user: {
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
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { t } = useLanguage();
  const [emailCopied, setEmailCopied] = useState(false);
  const avatarUrl = getDiscordAvatarUrl(
    user.discordId,
    user.avatar,
    user.discriminator || "0",
  );
  const socialLink = user.contactLinks.find(Boolean);
  const socialPlatform = socialLink
    ? detectSocialPlatform(socialLink)
    : undefined;

  const availabilityLabels = user.availability.map((availability) => {
    switch (availability) {
      case "freelance":
        return t.profile.availabilityFreelance;
      case "part_time":
        return t.profile.availabilityPartTime;
      case "full_time":
        return t.profile.availabilityFullTime;
      case "consulting":
        return t.profile.availabilityConsulting;
      case "not_available":
        return t.profile.availabilityNotAvailable;
      default:
        return availability;
    }
  });

  const socialLabel = (() => {
    switch (socialPlatform) {
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
  })();

  const socialIcon = (() => {
    switch (socialPlatform) {
      case "linkedin":
        return <LinkedInIcon size={18} />;
      case "github":
        return <GithubIcon size={18} />;
      case "x":
        return <TwitterIcon size={18} />;
      case "youtube":
        return <YouTubeIcon size={18} />;
      case "instagram":
        return <InstagramIcon size={18} />;
      case "discord":
        return <DiscordIcon size={18} />;
      default:
        return undefined;
    }
  })();

  const handleCopyEmail = async () => {
    if (!user.contactEmail) return;
    await navigator.clipboard.writeText(user.contactEmail);
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100svh-8rem)] px-4 py-8 sm:px-6 sm:py-12">
      <Card className={`mx-auto w-full max-w-5xl ${cardStyles.base}`}>
        <CardBody className="p-0">
          <div className={`h-24 rounded-t-lg sm:h-32 ${gradients.primary}`} />

          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
            <header className="-mt-12 flex flex-col items-center gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
              <Avatar
                className="h-24 w-24 flex-shrink-0 border-4 border-background shadow-lg sm:h-28 sm:w-28"
                name={user.name || user.username}
                src={avatarUrl}
              />
              <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
                <h1 className={`${typography.h1} truncate text-foreground`}>
                  {user.name || user.username}
                </h1>
                <p className="mt-1 text-sm text-default-500">@{user.handler}</p>
                {user.title ? (
                  <p
                    className={`${typography.bodyLarge} mt-2 font-medium text-default-600`}
                  >
                    {user.title}
                  </p>
                ) : null}
              </div>
            </header>

            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
              {user.country ? (
                <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-default-200/70 bg-default-50 px-3 text-sm text-default-600">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-5 rounded-sm object-cover"
                    src={getCountryFlagUrl(user.country, "24")}
                  />
                  {getCountryName(user.country)}
                </span>
              ) : null}
              {user.englishLevel ? (
                <span className="inline-flex min-h-9 items-center rounded-full border border-default-200/70 bg-default-50 px-3 text-sm text-default-600">
                  {t.profile.english}: {user.englishLevel}
                </span>
              ) : null}
              {availabilityLabels.length > 0 ? (
                <span className="inline-flex min-h-9 items-center rounded-full border border-primary/20 bg-primary/10 px-3 text-sm font-medium text-primary">
                  {availabilityLabels.join(", ")}
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="min-w-0 space-y-7">
                {user.description ? (
                  <section aria-labelledby="profile-about-heading">
                    <h2
                      className={`${typography.h4} mb-3 text-foreground`}
                      id="profile-about-heading"
                    >
                      {t.profile.about}
                    </h2>
                    <p
                      className={`${typography.body} whitespace-pre-wrap leading-7 text-default-600`}
                    >
                      {user.description}
                    </p>
                  </section>
                ) : null}

                {user.tags.length > 0 ? (
                  <section aria-labelledby="profile-skills-heading">
                    <h2
                      className={`${typography.h4} mb-3 text-foreground`}
                      id="profile-skills-heading"
                    >
                      {t.profile.skills}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag) => (
                        <Chip
                          key={tag}
                          className={chipStyles.base}
                          classNames={chipStyles.classNames}
                          color="primary"
                          size="md"
                          variant="flat"
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              {user.contactEmail || user.link || socialLink ? (
                <aside className="rounded-2xl border border-default-200/70 bg-default-50/60 p-4 sm:p-5">
                  <h2 className={`${typography.h4} mb-4 text-foreground`}>
                    {t.profile.contact}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {user.contactEmail ? (
                      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-default-200/70 bg-content1 p-2 pl-3">
                        <a
                          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          href={`mailto:${user.contactEmail}`}
                        >
                          {user.contactEmail}
                        </a>
                        <Button
                          aria-label={t.profile.copyEmail}
                          color={emailCopied ? "success" : "default"}
                          size="sm"
                          variant="flat"
                          onPress={handleCopyEmail}
                        >
                          {emailCopied
                            ? t.profile.emailCopiedShort
                            : t.profile.copyEmailShort}
                        </Button>
                        <span aria-live="polite" className="sr-only">
                          {emailCopied ? t.profile.emailCopied : ""}
                        </span>
                      </div>
                    ) : null}

                    {user.link ? (
                      <a
                        className="inline-flex min-h-10 w-full items-center rounded-xl bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        href={user.link}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t.profile.visitWebsite}
                      </a>
                    ) : null}

                    {socialLink ? (
                      <a
                        className="inline-flex min-h-10 w-full items-center gap-2 rounded-xl bg-default-100 px-4 text-sm font-medium text-foreground transition-colors hover:bg-default-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        href={socialLink}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {socialIcon}
                        {socialLabel}
                      </a>
                    ) : null}
                  </div>
                </aside>
              ) : null}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
