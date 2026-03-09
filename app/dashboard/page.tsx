import { redirect } from "next/navigation";

import DashboardClient from "./dashboard-client";

import technologies from "@/config/technologies.json";
import { getViewerContext } from "@/lib/viewer";

export default async function DashboardPage() {
  const viewer = await getViewerContext();

  if (!viewer.session.user || !viewer.profile) {
    redirect("/login");
  }

  return (
    <DashboardClient
      allowedRoles={viewer.permissions.allowedRoles}
      initialProfile={viewer.profile}
      session={viewer.session}
      technologies={technologies}
    />
  );
}
