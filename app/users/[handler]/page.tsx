import { notFound } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
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
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex flex-col gap-1 items-center justify-center pt-8 pb-4">
          <Avatar className="w-32 h-32" src={avatarUrl} />
          <h1 className="text-3xl font-bold mt-4">
            {user.username}#{user.discriminator}
          </h1>
          <p className="text-default-500 text-sm">@{user.handler}</p>
        </CardHeader>

        <Divider />

        <CardBody className="gap-4 px-8 py-6">
          {user.description && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">About</span>
                <p className="text-sm text-default-600 whitespace-pre-wrap">
                  {user.description}
                </p>
              </div>
              <Divider className="my-2" />
            </>
          )}

          {user.link && (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Website</span>
                <Button
                  as="a"
                  color="primary"
                  href={user.link}
                  rel="noopener noreferrer"
                  size="sm"
                  target="_blank"
                  variant="flat"
                >
                  🔗 Visit Website
                </Button>
              </div>
              <Divider className="my-2" />
            </>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Member Since</span>
            <p className="text-sm text-default-500">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {user.roles && user.roles.length > 0 && (
            <>
              <Divider className="my-2" />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Server Roles</span>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((roleId) => (
                    <Chip key={roleId} size="sm" variant="flat">
                      {roleId}
                    </Chip>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
