export interface TagListProps {
  tags: string[];
  maxVisible?: number;
  className?: string;
}

export function TagList({
  tags,
  maxVisible = 3,
  className = "",
}: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 ? (
        <span className="inline-flex items-center rounded-full bg-default-100 px-2.5 py-1 text-xs font-medium text-default-700">
          +{remainingCount}
        </span>
      ) : null}
    </div>
  );
}
