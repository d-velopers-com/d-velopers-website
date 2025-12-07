"use client";

import { memo } from "react";
import { Chip } from "@heroui/chip";

export interface TagListProps {
    tags: string[];
    maxVisible?: number;
    className?: string;
}

/**
 * Displays a list of tags with overflow handling
 */
export const TagList = memo(function TagList({
    tags,
    maxVisible = 3,
    className = "",
}: TagListProps) {
    if (!tags || tags.length === 0) return null;

    const displayTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {displayTags.map((tag) => (
                <Chip
                    key={tag}
                    className="text-xs"
                    color="primary"
                    size="sm"
                    variant="flat"
                >
                    {tag}
                </Chip>
            ))}
            {remainingCount > 0 && (
                <Chip
                    className="text-xs"
                    color="default"
                    size="sm"
                    variant="flat"
                >
                    +{remainingCount}
                </Chip>
            )}
        </div>
    );
});
