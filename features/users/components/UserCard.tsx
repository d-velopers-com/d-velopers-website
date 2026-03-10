import Link from "next/link";

import { UserAvatar } from "./UserAvatar";
import { TagList } from "./TagList";
import type { PublicUser } from "../types";

export interface UserCardProps {
  user: PublicUser;
}

export function UserCard({ user }: UserCardProps) {
  const profileUrl = `/users/${user.handler}`;

  return (
    <article className="group h-full min-h-[140px] rounded-2xl border border-default-200/70 bg-content1 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        className="flex h-full flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        href={profileUrl}
      >
        <div className="mb-2 flex flex-shrink-0 items-start gap-3">
          <UserAvatar
            avatar={user.avatar}
            country={user.country}
            discordId={user.discordId}
            discriminator={user.discriminator}
            size="md"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate font-semibold leading-tight text-foreground">
              {user.name || user.username}
            </h3>
            <p className="truncate text-sm leading-tight text-foreground/75">
              {user.title || "\u00A0"}
            </p>
            {user.yoe !== null && user.yoe > 0 ? (
              <p className="text-xs leading-tight text-foreground/80">
                {user.yoe}+ exp
              </p>
            ) : null}
          </div>
        </div>
        <TagList className="mt-auto" maxVisible={3} tags={user.tags} />
      </Link>
    </article>
  );
}
