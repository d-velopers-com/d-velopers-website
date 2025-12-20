import {memo} from "react";
import {Card, CardBody} from "@heroui/card";
import {cardStyles, typography} from "@/lib/ui-constants";

/**
 * Empty state component
 */
export const EmptyState = memo(function EmptyState({message}: { message: string }) {
  return (
    <Card className={`${cardStyles.base} py-16`}>
      <CardBody className="flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-default-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className={`${typography.body} text-default-500 text-center max-w-md`}>
          {message}
        </p>
      </CardBody>
    </Card>
  );
});
