"use client";

import Link from "next/link";
import {
  GithubIcon,
  TwitterIcon,
  DiscordIcon,
  LinkedInIcon,
  YouTubeIcon,
  InstagramIcon,
} from "@/components/icons";
import { useLanguage } from "@/contexts/language-context";
import { typography } from "@/lib/ui-constants";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-default-200 dark:border-default-100 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-8 gap-6">
          {/* Social Icons */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="https://x.com/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.twitter}
            >
              <TwitterIcon size={24} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/diegoveloper/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.linkedin}
            >
              <LinkedInIcon size={24} />
            </Link>
            <Link
              href="https://www.youtube.com/user/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.youtube}
            >
              <YouTubeIcon size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.instagram}
            >
              <InstagramIcon size={24} />
            </Link>
            <Link
              href="http://www.github.com/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.github}
            >
              <GithubIcon size={24} />
            </Link>
            <Link
              href="https://www.d-velopers.com/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label={t.footer.discord}
            >
              <DiscordIcon size={24} />
            </Link>
          </div>

          {/* Copyright */}
          <p className={`${typography.body} text-default-500 text-center`}>
            © {currentYear} D-velopers. {t.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
