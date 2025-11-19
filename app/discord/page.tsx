"use client";

import { useLanguage } from "@/contexts/language-context";

export default function DiscordPage() {
  const { t } = useLanguage();

  return (
    <div
      className="w-full"
      style={{ height: "calc(100vh - 64px)", minHeight: "600px" }}
    >
      <iframe
        src="/discord/index.html"
        className="w-full h-full"
        style={{ border: "none", display: "block" }}
        title={t.discord.pageTitle}
      />
    </div>
  );
}
