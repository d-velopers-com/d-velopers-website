"use client";

import { useMemo } from "react";

import { useSessionContext } from "@/contexts/session-context";

export function useSession() {
  const session = useSessionContext();
  const status = useMemo(
    () => (session.user ? "authenticated" : "unauthenticated"),
    [session.user],
  );

  return { data: session, status };
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
