import { redirect } from "next/navigation";

import technologies from "@/config/technologies.json";
import { getViewerContext } from "@/lib/viewer";

import DashboardClient from "./dashboard-client";

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
