"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { LanguageProvider } from "@/contexts/language-context";
import { SessionProvider } from "@/contexts/session-context";
import type { SessionState } from "@/lib/viewer";


export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  initialSession: SessionState;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({
  children,
  themeProps,
  initialSession,
}: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <SessionProvider initialSession={initialSession}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </SessionProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
