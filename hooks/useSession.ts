"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  roles: string[];
}

interface SessionResponse {
  user: User | null;
  tokenExpired?: boolean;
}

export function useSession() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: SessionResponse) => {
        // If token expired, redirect to login with expired flag
        if (data.tokenExpired) {
          window.location.href = "/login?expired=true";
          return;
        }
        setSession(data);
        setStatus(data.user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        setSession({ user: null });
        setStatus("unauthenticated");
      });
  }, []);

  return { data: session, status };
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
