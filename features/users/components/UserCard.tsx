import type { PublicUser } from "../types";

import Link from "next/link";

import { getCountryName } from "@/lib/countries";

import { TagList } from "./TagList";
import { UserAvatar } from "./UserAvatar";

export interface UserCardProps {
  user: PublicUser;
}

export function UserCard({ user }: UserCardProps) {
  const profileUrl = `/users/${user.handler}`;

  return (
    <article className="group h-full min-h-[160px] rounded-2xl border border-default-200/70 bg-content1 shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-md">
      <Link
        className="flex h-full flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        href={profileUrl}
      >
        <div className="mb-3 flex flex-shrink-0 items-start gap-3">
          <UserAvatar
            avatar={user.avatar}
            country={user.country}
            discordId={user.discordId}
            discriminator={user.discriminator}
            size="lg"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
              {user.name || user.username}
            </h3>
            <p className="truncate text-xs leading-tight text-default-500">
              @{user.handler}
            </p>
            {user.country || (user.yoe !== null && user.yoe > 0) ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-default-500">
                {user.country ? (
                  <span>{getCountryName(user.country)}</span>
                ) : null}
                {user.yoe !== null && user.yoe > 0 ? (
                  <span>{user.yoe}+ exp</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {user.title ? (
          <p className="mb-3 line-clamp-2 text-sm leading-5 text-foreground/80">
            {user.title}
          </p>
        ) : null}
        <TagList className="mt-auto" maxVisible={3} tags={user.tags} />
      </Link>
    </article>
  );
}
