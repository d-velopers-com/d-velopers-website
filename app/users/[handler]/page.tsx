import { notFound } from "next/navigation";

import ProfileClient from "./profile-client";

import { getUserByHandler } from "@/lib/user";

type ProfilePageProps = {
  params: Promise<{ handler: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handler } = await params;
  const user = await getUserByHandler(handler);

  if (!user || !user.isPublic) {
    notFound();
  }

  return (
    <ProfileClient
      user={{
        username: user.username,
        discriminator: user.discriminator,
        handler: user.handler,
        avatar: user.avatar,
        discordId: user.discordId,
        description: user.description,
        link: user.link,
        contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
        contactEmail: user.contactEmail,
        country: user.country,
        name: user.name,
        title: user.title,
        tags: Array.isArray(user.tags) ? user.tags : [],
        englishLevel: user.englishLevel,
        availability: Array.isArray(user.availability) ? user.availability : [],
        joinedServerAt: user.joinedServerAt?.toISOString() ?? null,
      }}
    />
  );
}
