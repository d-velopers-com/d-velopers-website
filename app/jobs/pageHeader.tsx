import {memo} from "react";
import {Card, CardBody} from "@heroui/card";
import {cardStyles} from "@/lib/ui-constants";
import {Chip} from "@heroui/chip";

/**
 * Page header component
 */
export const PageHeader = memo(function PageHeader(
  {
    title,
    subtitle,
    totalPosts
  }: {
    title: string;
    subtitle: string;
    totalPosts?: number;
  }) {
  return (
    <Card className={cardStyles.base}>
      <CardBody className="text-center py-8 px-6">
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-default-500 mt-2 max-w-lg mx-auto">
          {subtitle}
        </p>
        {totalPosts !== undefined && totalPosts > 0 && (
          <Chip
            size="sm"
            variant="flat"
            color="default"
            className="mt-4"
          >
            {totalPosts} opportunities
          </Chip>
        )}
      </CardBody>
    </Card>
  );
});
