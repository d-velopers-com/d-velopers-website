"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "@/hooks/useSession";
import { useLanguage } from "@/contexts/language-context";
import { DiscordIcon } from "@/components/icons";
import { focusStates, typography } from "@/lib/ui-constants";
import { getDiscordAvatarProxyUrl } from "@/shared/lib";
import type { SessionState, ViewerPermissions } from "@/lib/viewer";

interface NavbarProps {
  permissions: ViewerPermissions;
  session: SessionState;
}

function SessionAvatar({
  avatarUrl,
  username,
}: {
  avatarUrl?: string;
  username: string;
}) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-default-100 text-sm font-semibold text-foreground ring-2 ring-default-200/70">
      {avatarUrl ? (
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          height={40}
          sizes="40px"
          src={avatarUrl}
          width={40}
        />
      ) : (
        initial
      )}
    </span>
  );
}

export function Navbar({ permissions, session }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const status = session.user ? "authenticated" : "unauthenticated";

  const avatarUrl = session?.user
    ? getDiscordAvatarProxyUrl(
        session.user.id,
        session.user.avatar,
        session.user.discriminator,
        80,
      )
    : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-default-200/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-default-200/70 bg-content1 text-foreground transition-colors hover:bg-default-100 sm:hidden"
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            </span>
            <span className="relative h-5 w-5">
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-[7px] rounded-full bg-current transition-transform ${
                  isMenuOpen ? "translate-y-0 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 translate-y-[6px] rounded-full bg-current transition-transform ${
                  isMenuOpen ? "translate-y-0 rotate-[-45deg]" : ""
                }`}
              />
            </span>
          </button>

          <Link
            aria-label="D-VELOPERS"
            className="inline-flex items-center gap-2 rounded-xl px-1 py-1 text-foreground transition hover:bg-default-100/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
            href="/"
          >
            <img
              alt="D-VELOPERS"
              className="block h-14 w-auto dark:hidden"
              height={70}
              src="/png_logo_dark.png"
              width={70}
            />
            <img
              alt="D-VELOPERS"
              className="hidden h-14 w-auto dark:block"
              height={70}
              src="/png_logo_light.png"
              width={70}
            />
          </Link>
        </div>

        <nav aria-label={t.nav.primaryNavigation} className="hidden sm:block">
          <ul className="flex items-center gap-2">
            <li>
              <ThemeSwitch />
            </li>
            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <Button
                as={Link}
                className="data-[hover=true]:bg-transparent"
                href="/jobs"
                size="md"
                variant="light"
              >
                {t.nav.jobs}
              </Button>
            </li>
            {status === "authenticated" && session?.user ? (
              <>
                <li>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        aria-label={t.nav.profileActions}
                        className="min-w-0 rounded-full p-0"
                        isIconOnly
                        variant="light"
                      >
                        <SessionAvatar
                          avatarUrl={avatarUrl}
                          username={session.user.username}
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={t.nav.profileActions} variant="flat">
                      <DropdownItem key="dashboard" href="/dashboard">
                        {t.nav.profile}
                      </DropdownItem>
                      {permissions.hasJobManagementRole ? (
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
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button as={Link} href="/login" size="md" variant="light">
                    {t.nav.signIn}
                  </Button>
                </li>
                <li>
                  <Button
                    as={Link}
                    className="bg-[#5865F2] font-medium text-white hover:bg-[#4752C4]"
                    href="/discord"
                    size="sm"
                    startContent={<DiscordIcon size={20} />}
                  >
                    {t.nav.joinDiscord}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {isMenuOpen ? (
        <nav
          aria-label={t.nav.primaryNavigation}
          className="border-t border-default-200/60 bg-background/95 sm:hidden"
          id="mobile-navigation"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {status === "authenticated" && session?.user ? (
              <>
                <li>
                  <div className="flex items-center gap-3 rounded-2xl border border-default-200/70 bg-content1 px-3 py-3">
                    <SessionAvatar
                      avatarUrl={avatarUrl}
                      username={session.user.username}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`${typography.label} truncate`}>
                        {session.user.username}
                      </p>
                      <Link
                        className={`${typography.caption} text-default-600 hover:text-default-900 dark:text-default-300 dark:hover:text-default-50`}
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t.nav.profile}
                      </Link>
                    </div>
                  </div>
                </li>
              </>
            ) : null}
            <li>
              <div className="flex items-center justify-between rounded-2xl border border-default-200/70 bg-content1 px-3 py-2">
                <span className={`${typography.label} flex items-center`}>
                  {t.common.language}
                </span>
                <LanguageSwitcher />
              </div>
            </li>
            <li>
              <div className="flex items-center justify-between rounded-2xl border border-default-200/70 bg-content1 px-3 py-2">
                <span className={`${typography.label} flex items-center`}>
                  {t.nav.theme}
                </span>
                <ThemeSwitch />
              </div>
            </li>
            <li>
              <Button
                as={Link}
                className={`w-full justify-start ${focusStates.button}`}
                href="/jobs"
                variant="light"
                onPress={() => setIsMenuOpen(false)}
              >
                {t.nav.jobs}
              </Button>
            </li>

            {status === "authenticated" ? (
              <>
                {permissions.hasJobManagementRole ? (
                  <li>
                    <Button
                      as={Link}
                      className={`w-full justify-start ${focusStates.button}`}
                      href="/jobs/manage"
                      variant="light"
                      onPress={() => setIsMenuOpen(false)}
                    >
                      {t.nav.manageJobs}
                    </Button>
                  </li>
                ) : null}
                <li>
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
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button
                    as={Link}
                    className={`w-full ${focusStates.button}`}
                    href="/login"
                    variant="light"
                    onPress={() => setIsMenuOpen(false)}
                  >
                    {t.nav.signIn}
                  </Button>
                </li>
                <li>
                  <Button
                    as={Link}
                    className="w-full bg-[#5865F2] font-medium text-white hover:bg-[#4752C4]"
                    href="/discord"
                    size="md"
                    startContent={<DiscordIcon size={20} />}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    {t.nav.joinDiscord}
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
