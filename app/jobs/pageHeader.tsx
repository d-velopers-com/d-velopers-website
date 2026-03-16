import { memo } from "react";
import { Button } from "@heroui/button";
import Link from "next/link";

import { DiscordIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/language-context";

/**
 * Page header component
 */
export const PageHeader = memo(function PageHeader() {
  const { t } = useLanguage();

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(18, 16, 34, 0.7) 0%, rgba(86, 65, 223, 0.5) 100%), url('/job-header-bg.jpg')",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative z-10 flex flex-col items-center text-center py-10 px-6">
        <h1 className="text-4xl font-bold text-white">
          {t.jobs.title}
        </h1>
        <p className="text-white mt-3 max-w-lg mx-auto opacity-90">
          {t.jobs.subtitle}
        </p>
        <Button
          as={Link}
          className="mt-6 bg-[#5865F2] font-medium text-white hover:bg-[#4752C4]"
          href="/discord"
          size="md"
          startContent={<DiscordIcon size={20} />}
        >
          {t.nav.joinDiscord}
        </Button>
      </div>
    </div>
  );
});
