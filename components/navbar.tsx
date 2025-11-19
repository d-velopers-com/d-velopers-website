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
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/hooks/useSession";
import { useLanguage } from "@/contexts/language-context";
import { DiscordIcon } from "@/components/icons";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarUrl = session?.user
    ? session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(session.user.discriminator) % 5}.png`
    : undefined;

  // Usar un logo por defecto durante SSR para evitar hydration mismatch
  const logoSrc = mounted
    ? theme === "dark" || !theme
      ? "/png_logo_light.png"
      : "/png_logo_dark.png"
    : "/png_logo_light.png"; // Default durante SSR

  return (
    <HeroNavbar
      isBlurred
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand className="mt-1">
          <Link href="/">
            <Image
              alt="D-VELOPERS"
              className="h-14 w-auto"
              height={70}
              src={logoSrc}
              width={150}
              suppressHydrationWarning
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand className="mt-1">
          <Link href="/">
            <Image
              alt="D-VELOPERS"
              className="h-14 w-auto"
              height={70}
              src={logoSrc}
              width={150}
              suppressHydrationWarning
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        {status === "unauthenticated" && (
          <NavbarItem className="hidden sm:flex">
            <Button
              as={Link}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-full"
              href="/discord"
              size="md"
              startContent={<DiscordIcon size={20} />}
            >
              {t.nav.joinDiscord}
            </Button>
          </NavbarItem>
        )}
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">
          <LanguageSwitcher />
        </NavbarItem>
        {status === "loading" ? (
          <NavbarItem>
            <div className="w-8 h-8 rounded-full bg-default-200 animate-pulse" />
          </NavbarItem>
        ) : (
          status === "authenticated" &&
          session?.user && (
            <NavbarItem className="hidden sm:flex">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer"
                    size="sm"
                    src={avatarUrl}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label={t.nav.profileActions} variant="flat">
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
        {status === "unauthenticated" && (
          <NavbarMenuItem>
            <Button
              as={Link}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-full"
              href="/discord"
              size="md"
              startContent={<DiscordIcon size={20} />}
              onPress={() => setIsMenuOpen(false)}
            >
              {t.nav.joinDiscord}
            </Button>
          </NavbarMenuItem>
        )}
        {status === "authenticated" && session?.user && (
          <>
            <NavbarMenuItem>
              <div className="flex items-center gap-3 w-full py-2">
                <Avatar size="sm" src={avatarUrl} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {session.user.username}
                  </span>
                  <Link
                    className="text-xs text-default-500 hover:text-default-700"
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.nav.profile}
                  </Link>
                </div>
              </div>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <div className="border-t border-default-200 dark:border-default-100 my-2" />
            </NavbarMenuItem>
          </>
        )}
        <NavbarMenuItem>
          <div className="flex items-center justify-between w-full py-1">
            <span className="text-sm font-medium flex items-center h-6">
              {t.common.language}
            </span>
            <div className="flex items-center justify-center h-6 min-w-[2.5rem]">
              <LanguageSwitcher />
            </div>
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <div className="flex items-center justify-between w-full py-1">
            <span className="text-sm font-medium flex items-center h-6">
              {t.nav.theme}
            </span>
            <div className="flex items-center justify-center h-6 min-w-[2.5rem]">
              <ThemeSwitch />
            </div>
          </div>
        </NavbarMenuItem>
        {status === "authenticated" && (
          <>
            <NavbarMenuItem>
              <div className="border-t border-default-200 dark:border-default-100 my-2" />
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                className="w-full justify-start"
                variant="light"
                onPress={() => {
                  setIsMenuOpen(false);
                  signOut();
                }}
              >
                {t.common.logout}
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
}
