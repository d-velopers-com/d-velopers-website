"use client";

import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export interface UserCardSkeletonProps {
    className?: string;
}

/**
 * Skeleton loader for UserCard component
 */
export function UserCardSkeleton({ className = "" }: UserCardSkeletonProps) {
    return (
        <Card className={`p-4 overflow-hidden h-[140px] ${className}`}>
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="rounded-lg w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton className="rounded-lg w-3/4 h-5" />
                        <Skeleton className="rounded-lg w-full h-4" />
                    </div>
                </div>
                <div className="flex gap-2 mt-auto">
                    <Skeleton className="rounded-lg w-16 h-6" />
                    <Skeleton className="rounded-lg w-20 h-6" />
                    <Skeleton className="rounded-lg w-14 h-6" />
                </div>
            </div>
        </Card>
    );
}
