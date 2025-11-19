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

export function Footer() {
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
              aria-label="Twitter"
            >
              <TwitterIcon size={24} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/diegoveloper/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={24} />
            </Link>
            <Link
              href="https://www.youtube.com/user/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <YouTubeIcon size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={24} />
            </Link>
            <Link
              href="http://www.github.com/diegoveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={24} />
            </Link>
            <Link
              href="https://www.d-velopers.com/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-foreground transition-colors"
              aria-label="Discord"
            >
              <DiscordIcon size={24} />
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-default-500 text-center">
            © {currentYear} D-velopers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
