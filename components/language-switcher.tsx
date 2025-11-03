"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { useLanguage } from "@/contexts/language-context";

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button size="sm" variant="light">
          {locale.toUpperCase()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t.common.language}
        onAction={(key) => setLocale(key as "en" | "es")}
      >
        <DropdownItem key="en">English</DropdownItem>
        <DropdownItem key="es">Español</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
