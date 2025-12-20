import {memo} from "react";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {cardStyles} from "@/lib/ui-constants";
import {Skeleton} from "@heroui/skeleton";

/**
 * Job card skeleton for loading state
 */
export const JobCardSkeleton = memo(function JobCardSkeleton() {
  return (
    <Card className={`overflow-hidden ${cardStyles.base}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4 border-b border-default-200">
        <Skeleton className="h-5 w-3/4 rounded-lg"/>
        <Skeleton className="h-6 w-16 rounded-full flex-shrink-0"/>
      </CardHeader>
      <CardBody className="p-0">
        <Skeleton className="h-64 w-full"/>
      </CardBody>
    </Card>
  );
});
