import { notFound } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

import { getUserByHandler } from "@/lib/user";

interface PageProps {
  params: Promise<{ handler: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { handler } = await params;
  const user = await getUserByHandler(handler);

  if (!user || !user.isPublic) {
    notFound();
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="max-w-2xl w-full shadow-lg border-1 border-default-200">
        <CardBody className="p-0">
          <div className="relative bg-info h-32 rounded-t-lg" />

          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-12 mb-4">
              <Avatar
                className="w-24 h-24 border-4 border-background shadow-lg ring-2 ring-info/30"
                src={avatarUrl}
              />

              <h1 className="text-2xl font-bold mt-4 mb-1 text-foreground">
                {user.username}
              </h1>
              <p className="text-default-500 text-sm font-medium">
                @{user.handler}
              </p>
            </div>

            {user.description && (
              <div className="mb-4 bg-default-50/50 dark:bg-default-100/10 rounded-lg p-4 border border-default-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="text-xs font-bold text-default-700">
                    About
                  </span>
                </div>
                <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                  {user.description}
                </p>
              </div>
            )}

            {user.link && (
              <div className="mb-4">
                <Button
                  fullWidth
                  as="a"
                  className="font-medium text-sm"
                  color="primary"
                  href={user.link}
                  rel="noopener noreferrer"
                  size="sm"
                  startContent={
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  }
                  target="_blank"
                  variant="flat"
                >
                  Visit Website
                </Button>
              </div>
            )}

            {user.roles && user.roles.length > 0 && (
              <div className="bg-default-50/50 dark:bg-default-100/10 rounded-lg p-4 border border-default-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-4 h-4 text-purple"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="text-xs font-bold text-default-700">
                    Server Roles
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((roleId, index) => (
                    <Chip
                      key={roleId}
                      className="font-medium"
                      color={
                        index % 4 === 0
                          ? "primary"
                          : index % 4 === 1
                            ? "secondary"
                            : index % 4 === 2
                              ? "success"
                              : "warning"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {roleId}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
