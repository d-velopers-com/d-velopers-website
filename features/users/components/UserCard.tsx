"use client";

import { memo } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { UserAvatar } from "./UserAvatar";
import { TagList } from "./TagList";
import type { PublicUser } from "../types";

export interface UserCardProps {
    user: PublicUser;
    yearsLabel?: string;
}

/**
 * Card component displaying a user's public profile summary
 */
export const UserCard = memo(function UserCard({
    user,
    yearsLabel = "años de experiencia"
}: UserCardProps) {
    const profileUrl = `/users/${user.handler}`;

    return (
        <Card className="group hover:scale-[1.02] transition-transform h-[140px]">
            <CardBody className="p-0">
                <Link href={profileUrl} className="block p-4 h-full flex flex-col">
                    <div className="flex items-start gap-3 flex-shrink-0 mb-2">
                        <UserAvatar
                            avatar={user.avatar}
                            discordId={user.discordId}
                            discriminator={user.discriminator}
                            country={user.country}
                            size="md"
                        />
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <h3 className="font-semibold text-foreground leading-tight truncate">
                                {user.name || user.username}
                            </h3>
                            <p className="text-sm text-default-500 truncate leading-tight">
                                {user.title || "\u00A0"}
                            </p>
                            {user.yoe && user.yoe > 0 && (
                                <p className="text-xs text-default-400 leading-tight">
                                    {user.yoe}+ {yearsLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <TagList tags={user.tags} maxVisible={3} className="mt-auto" />
                </Link>
            </CardBody>
        </Card>
    );
});
