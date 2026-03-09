"use client";

import { createContext, useContext } from "react";

import type { SessionState } from "@/lib/viewer";

const defaultSessionState: SessionState = {
  user: null,
  discordReauthRequired: false,
};

const SessionContext = createContext<SessionState>(defaultSessionState);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: SessionState;
}) {
  return (
    <SessionContext.Provider value={initialSession}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
