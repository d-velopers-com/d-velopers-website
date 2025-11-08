"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { Locale } from "@/types/i18n";
import { en } from "@/locales/en";
import { es } from "@/locales/es";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof en;
}

const translations = { en, es };

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("locale") as Locale;

      if (savedLocale && (savedLocale === "en" || savedLocale === "es")) {
        setLocaleState(savedLocale);
      } else {
        const browserLang = navigator.language.toLowerCase();
        const detectedLocale = browserLang.startsWith("es") ? "es" : "en";
        setLocaleState(detectedLocale);
        localStorage.setItem("locale", detectedLocale);
      }
    } catch (error) {
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t: translations[locale] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
