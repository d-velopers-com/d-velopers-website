"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";
import { useState } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/hooks/useSession";
import { useLanguage } from "@/contexts/language-context";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { t } = useLanguage();


  const avatarUrl = session?.user
    ? session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.discriminator) % 5}.png`
    : undefined;

  return (
    <HeroNavbar
      isBlurred
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link className="font-bold text-inherit" href="/">
            D-VELOPERS
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand>
          <Link className="font-bold text-inherit" href="/">
            D-VELOPERS
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <LanguageSwitcher />
        </NavbarItem>
        {status === "loading" ? (
          <NavbarItem>
            <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
          </NavbarItem>
        ) : (
          status === "authenticated" &&
          session?.user && (
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer"
                    size="sm"
                    src={avatarUrl}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="dashboard" href="/dashboard">
                    {t.nav.profile}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => signOut()}
                  >
                    {t.common.logout}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          )
        )}
      </NavbarContent>

      <NavbarMenu>
        {status === "authenticated" && (
          <NavbarMenuItem>
            <Button
              className="w-full justify-start"
              color="danger"
              variant="flat"
              onPress={() => {
                setIsMenuOpen(false);
                signOut();
              }}
            >
              {t.common.logout}
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
}
