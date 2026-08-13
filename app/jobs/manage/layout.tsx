import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage jobs",
  robots: { index: false, follow: false },
};

export default function ManageJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
