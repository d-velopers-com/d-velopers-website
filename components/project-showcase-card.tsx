"use client";

import type { OGMetadata } from "@/types/og-metadata";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { getDiscordAvatarProxyUrl } from "@/shared/lib";

export interface ProjectShowcaseProject {
  title: string;
  description: string | null;
  url: string;
  coverImageUrl: string | null;
}

export interface ProjectShowcaseCreator {
  profilePublic: boolean;
  name: string | null;
  handler: string | null;
  discordId: string | null;
  discriminator: string | null;
  avatar: string | null;
}

interface ProjectShowcaseCardProps {
  project: ProjectShowcaseProject;
  creator: ProjectShowcaseCreator;
  labels: {
    openProject: string;
    createdBy: string;
    communityMember: string;
    noDescription: string;
    untitledProject: string;
    domainPlaceholder: string;
  };
  preview?: boolean;
  headingLevel?: "h2" | "h3";
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

function getSafeImageUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const imageUrl = new URL(value);
    if (
      (imageUrl.protocol !== "https:" && imageUrl.protocol !== "http:") ||
      imageUrl.username ||
      imageUrl.password
    ) {
      return null;
    }

    return imageUrl.href;
  } catch {
    return null;
  }
}

function ProductIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.75 7.25 12 3.5l7.25 3.75v9.5L12 20.5l-7.25-3.75v-9.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="m5 7.5 7 3.75 7-3.75M12 11.5v8.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ProjectPreviewImage({
  project,
  preview,
}: {
  project: ProjectShowcaseProject;
  preview: boolean;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const customImageUrl = getSafeImageUrl(project.coverImageUrl);
  const hasCustomCover = Boolean(project.coverImageUrl?.trim());
  const [ogImage, setOgImage] = useState<{
    projectUrl: string;
    imageUrl: string;
  } | null>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = hasCustomCover
    ? customImageUrl
    : ogImage?.projectUrl === project.url
      ? ogImage.imageUrl
      : null;
  const hasImageError = imageUrl === failedImageUrl;

  useEffect(() => {
    if (hasCustomCover) {
      return;
    }

    const previewElement = previewRef.current;
    if (!previewElement) {
      return;
    }

    let isActive = true;
    let controller: AbortController | null = null;
    let debounceTimer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        observer.disconnect();
        debounceTimer = window.setTimeout(() => {
          controller = new AbortController();

          void fetch(
            `/api/og-metadata?url=${encodeURIComponent(project.url)}`,
            {
              signal: controller.signal,
            },
          )
            .then(async (response) => {
              if (!response.ok) {
                return;
              }

              const metadata = (await response.json()) as OGMetadata;
              const safeImageUrl = getSafeImageUrl(metadata.image);
              if (isActive && safeImageUrl) {
                setOgImage({ projectUrl: project.url, imageUrl: safeImageUrl });
              }
            })
            .catch(() => {})
            .finally(() => {
              controller = null;
            });
        }, 350);
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(previewElement);

    return () => {
      isActive = false;
      observer.disconnect();
      window.clearTimeout(debounceTimer);
      controller?.abort();
    };
  }, [hasCustomCover, project.url]);

  return (
    <div
      className="relative aspect-[16/7] overflow-hidden bg-primary/[0.04]"
      ref={previewRef}
    >
      {imageUrl && !hasImageError ? (
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          fill
          loading={preview ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
          src={imageUrl}
          unoptimized
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-primary/40">
          <ProductIcon className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}

function CreatorAvatar({ creator }: { creator: ProjectShowcaseCreator }) {
  const initial = creator.name?.trim().charAt(0).toUpperCase() || "D";

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-default-200/70">
      {creator.profilePublic && creator.discordId ? (
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          height={48}
          sizes="48px"
          src={getDiscordAvatarProxyUrl(
            creator.discordId,
            creator.avatar,
            creator.discriminator || "0",
            96,
          )}
          width={48}
        />
      ) : (
        initial
      )}
    </span>
  );
}

export default function ProjectShowcaseCard({
  project,
  creator,
  labels,
  preview = false,
  headingLevel = "h2",
}: ProjectShowcaseCardProps) {
  const TitleTag = headingLevel;
  const openLinkProps = {
    href: project.url,
    rel: "noopener noreferrer",
    target: "_blank",
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-default-200/70 bg-content1 transition-colors hover:border-primary/40">
      {preview ? (
        <ProjectPreviewImage project={project} preview />
      ) : (
        <a
          {...openLinkProps}
          aria-label={`${labels.openProject}: ${project.title}`}
          className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <ProjectPreviewImage project={project} preview={false} />
        </a>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <TitleTag className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          {preview ? (
            <span className="flex items-start justify-between gap-4">
              <span className="line-clamp-2 min-w-0">
                {project.title || labels.untitledProject}
              </span>
              <span aria-hidden="true" className="-mr-1 shrink-0 text-primary">
                ↗
              </span>
            </span>
          ) : (
            <a
              {...openLinkProps}
              aria-label={`${labels.openProject}: ${project.title}`}
              className="flex items-start justify-between gap-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="line-clamp-2 min-w-0">{project.title}</span>
              <svg
                aria-hidden="true"
                className="-mr-1 h-7 w-7 shrink-0 text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 17 17 7M7 7h10v10"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </a>
          )}
        </TitleTag>
        <p className="mt-1 truncate font-mono text-sm text-default-500">
          {getHostname(project.url) || labels.domainPlaceholder}
        </p>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-default-600">
          {project.description || labels.noDescription}
        </p>

        <div className="mt-auto flex items-center gap-3 border-t border-default-200/60 pt-4">
          <CreatorAvatar creator={creator} />
          <div className="min-w-0">
            <span className="sr-only">{labels.createdBy}</span>
            {creator.profilePublic && creator.handler ? (
              <Link
                className="block truncate text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={`/users/${creator.handler}`}
              >
                {creator.name}
                <span className="mt-0.5 block truncate font-normal text-default-500">
                  @{creator.handler}
                </span>
              </Link>
            ) : (
              <p className="text-sm font-medium text-default-500">
                {creator.name || labels.communityMember}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
