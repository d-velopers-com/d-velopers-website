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
import { SnowToggle } from "@/components/snow-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/hooks/useSession";
import { useLanguage } from "@/contexts/language-context";
import { DiscordIcon } from "@/components/icons";
import { typography, focusStates } from "@/lib/ui-constants";
import { useProfile } from "@/hooks/useProfile";
import { validateRecentActivation } from "@/lib/utils";
import { getDiscordAvatarUrl } from "@/shared/lib";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasJobManagementRole, setHasJobManagementRole] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [enableJobs, setEnableJobs] = useState<boolean | undefined>(undefined);
  const { profile } = useProfile();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user?.roles) {
      return;
    }
    // Fetch both staff and collaborator roles to determine job management access
    Promise.all([
      fetch("/api/config/staff-roles").then((res) => res.json()),
      fetch("/api/config/collaborator-roles").then((res) => res.json()).catch(() => ({ roles: [] }))
    ])
      .then(([staffData, collabData]) => {
        const staffRoles = staffData.roles || [];
        const collabRoles = collabData.roles || [];
        const userRoles = session?.user?.roles || [];
        const hasRole = userRoles.some((role) =>
          staffRoles.includes(role) || collabRoles.includes(role)
        );
        setHasJobManagementRole(hasRole);
      })
      .catch(() => setHasJobManagementRole(false));
  }, [session, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.roles) {
      return;
    }

    const hasRecentActivation = validateRecentActivation(profile?.profileActivatedAt);

    // Fetch allowed roles and collaborator roles
    Promise.all([
      fetch("/api/config/allowed-roles").then((res) => res.json()),
      fetch("/api/config/collaborator-roles").then((res) => res.json()).catch(() => ({ roles: [] })),
      fetch("/api/config/staff-roles").then((res) => res.json()).catch(() => ({ roles: [] }))
    ])
      .then(([allowedData, collabData, staffData]) => {
        const backRoles = allowedData.roles || [];
        const collabRoles = collabData.roles || [];
        const staffRoles = staffData.roles || [];
        const userRoles = session?.user?.roles || [];

        const hasAllowedRole = userRoles.some((role) => backRoles.includes(role));
        const hasCollaboratorRole = userRoles.some((role) => collabRoles.includes(role));
        const hasStaffRole = userRoles.some((role) => staffRoles.includes(role));
        const isServerMember = userRoles.length > 0;

        const canApplyTrialPeriod = isServerMember && !hasAllowedRole && !profile?.profileActivatedAt;

        // User can view jobs if they have allowed role, staff role, collaborator role, 
        // recent activation, or can apply trial period
        const canViewJobs = hasAllowedRole || hasStaffRole || hasCollaboratorRole ||
          hasRecentActivation || canApplyTrialPeriod;
        setEnableJobs(canViewJobs);
      })
      .catch(() => setEnableJobs(false));
  }, [session, status, profile]);

  const avatarUrl = session?.user
    ? getDiscordAvatarUrl(session.user.id, session.user.avatar, session.user.discriminator)
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
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">
          <SnowToggle />
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
            <>
              <NavbarItem className="hidden sm:flex">
                <Button
                  variant="light"
                  className="data-[hover=true]:bg-transparent"
                  as={Link}
                  href="/jobs"
                  size="md"
                >
                  {t.nav.jobs}
                </Button>
              </NavbarItem>
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
                    {hasJobManagementRole ? (
                      <DropdownItem key="manageJobs" href="/jobs/manage">
                        {t.nav.manageJobs}
                      </DropdownItem>
                    ) : null}
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
            </>
          )
        )}
      </NavbarContent>

      <NavbarMenu>
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
        {status === "authenticated" && session?.user && (
          <>
            <NavbarMenuItem>
              <div className="flex items-center gap-3 w-full py-2">
                <Avatar size="sm" src={avatarUrl} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`${typography.label} truncate`}>
                    {session.user.username}
                  </span>
                  <Link
                    className={`${typography.caption} hover:text-default-700`}
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
          <div
            className="flex items-center justify-between w-full py-1 cursor-pointer hover:bg-default-100 dark:hover:bg-default-50 rounded-lg px-2 -mx-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const button = e.currentTarget.querySelector(
                "button",
              ) as HTMLElement;
              if (button) {
                button.click();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const button = e.currentTarget.querySelector(
                  "button",
                ) as HTMLElement;
                if (button) {
                  button.click();
                }
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className={`${typography.label} flex items-center h-6`}>
              {t.common.language}
            </span>
            <span className="flex items-center justify-center h-6 min-w-[2.5rem]">
              <LanguageSwitcher />
            </span>
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <div
            className="flex items-center justify-between w-full py-1 cursor-pointer hover:bg-default-100 dark:hover:bg-default-50 rounded-lg px-2 -mx-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const input = e.currentTarget.querySelector(
                'input[type="checkbox"]',
              ) as HTMLElement;
              if (input) {
                input.click();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const input = e.currentTarget.querySelector(
                  'input[type="checkbox"]',
                ) as HTMLElement;
                if (input) {
                  input.click();
                }
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm font-medium flex items-center h-6">
              {t.nav.theme}
            </span>
            <span className="flex items-center justify-center h-6 min-w-[2.5rem]">
              <ThemeSwitch />
            </span>
          </div>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <div
            className="flex items-center justify-between w-full py-1 cursor-pointer hover:bg-default-100 dark:hover:bg-default-50 rounded-lg px-2 -mx-2 transition-colors"
            onClick={() => {
              // Trigger click handled by SnowToggle button
            }}
            role="button"
            tabIndex={0}
          >
            <span className="text-sm font-medium flex items-center h-6">
              ❄️ {t.nav.snow}
            </span>
            <span className="flex items-center justify-center h-6 min-w-[2.5rem]">
              <SnowToggle />
            </span>
          </div>
        </NavbarMenuItem>
        {status === "authenticated" && (
          <>
            {enableJobs ? (
              <NavbarMenuItem>
                <Button
                  as={Link}
                  className={`w-full justify-start ${focusStates.button} p-0`}
                  variant="light"
                  href="/jobs"
                  onPress={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  {t.nav.jobs}
                </Button>
              </NavbarMenuItem>
            ) : null}
            {hasJobManagementRole ? (
              <NavbarMenuItem>
                <Button
                  as={Link}
                  className={`w-full justify-start ${focusStates.button} p-0`}
                  variant="light"
                  href="/jobs/manage"
                  onPress={() => {
                    setIsMenuOpen(false);
                  }}
                >
                  {t.nav.manageJobs}
                </Button>
              </NavbarMenuItem>
            ) : null}

            <NavbarMenuItem>
              <div className="border-t border-default-200 dark:border-default-100 my-2" />
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                className={`w-full justify-start ${focusStates.button}`}
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
