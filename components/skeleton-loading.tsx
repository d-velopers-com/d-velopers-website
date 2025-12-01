import {Card, CardBody} from "@heroui/card";
import {Skeleton} from "@heroui/skeleton";

export function SkeletonLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-md w-full">
        <CardBody className="gap-4 p-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="rounded-full w-24 h-24 shimmer" />
            <Skeleton className="rounded-lg w-48 h-6 shimmer" />
            <Skeleton className="rounded-lg w-64 h-4 shimmer" />
            <Skeleton className="rounded-lg w-full h-20 shimmer" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
