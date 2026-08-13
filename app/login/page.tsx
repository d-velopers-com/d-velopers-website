"use client";

import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { DiscordIconLarge } from "@/components/discord-icon";
import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { typography, focusStates, stateColors } from "@/lib/ui-constants";

function LoginContent() {
  const { status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get("expired") === "true";

  const {
    isOpen: isTermsOpen,
    onOpen: onTermsOpen,
    onOpenChange: onTermsOpenChange,
  } = useDisclosure();

  const {
    isOpen: isPrivacyOpen,
    onOpen: onPrivacyOpen,
    onOpenChange: onPrivacyOpenChange,
  } = useDisclosure();

  useEffect(() => {
    if (status === "authenticated" && !isSessionExpired) {
      router.push("/dashboard");
    }
  }, [isSessionExpired, status, router]);

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/login";
  };

  if (status === "authenticated" && !isSessionExpired) {
    return null;
  }

  return (
    <div className="min-h-[calc(100svh-8rem)] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
        <section className="max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {t.login.eyebrow}
          </p>
          <h1 className={`${typography.h1} text-foreground sm:text-4xl`}>
            {t.login.communityTitle}
          </h1>
          <p
            className={`${typography.bodyLarge} mt-4 max-w-lg leading-7 text-default-600`}
          >
            {t.login.communityDescription}
          </p>
          <ul className="mt-7 space-y-3 border-l-2 border-primary/25 pl-5 text-sm font-medium text-foreground/80">
            <li>{t.login.benefitProfile}</li>
            <li>{t.login.benefitNetwork}</li>
            <li>{t.login.benefitJobs}</li>
          </ul>
          <div className="mt-8 rounded-2xl border border-default-200/70 bg-default-50/70 p-4">
            <p className="font-semibold text-foreground">
              {t.login.discordReason}
            </p>
            <p className="mt-1 text-sm leading-6 text-default-600">
              {t.login.discordReasonDescription}
            </p>
          </div>
        </section>

        <Card className="w-full border border-default-200/70 shadow-lg">
          <CardHeader className="flex flex-col items-start gap-1 px-6 pb-2 pt-7 sm:px-8">
            <h2 className={typography.h2}>{t.login.title}</h2>
            <p className={`${typography.body} text-default-500`}>
              {t.login.subtitle}
            </p>
          </CardHeader>

          <CardBody className="px-6 py-6 sm:px-8">
            {isSessionExpired && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${stateColors.warning.full} mb-4`}
              >
                <div className="flex-1">
                  <p
                    className={`${typography.body} font-semibold ${stateColors.warning.text} mb-1`}
                  >
                    {t.login.sessionExpiredTitle}
                  </p>
                  <p className={`${typography.caption} text-foreground/70`}>
                    {t.login.sessionExpiredDesc}
                  </p>
                </div>
              </div>
            )}
            <Button
              className={`bg-[#5865F2] hover:bg-[#4752C4] w-full ${focusStates.button}`}
              color="primary"
              size="lg"
              startContent={<DiscordIconLarge size={24} />}
              onPress={handleDiscordLogin}
            >
              {t.login.discordButton}
            </Button>
            <p className="mt-3 text-center text-xs text-default-500">
              {t.login.secureNote}
            </p>
          </CardBody>

          <Divider />

          <CardFooter className="px-6 py-6 sm:px-8">
            <p className={`${typography.captionMuted} text-center w-full`}>
              {t.login.terms}{" "}
              <Button
                as="span"
                className={`${typography.caption} h-auto p-0 min-w-0 bg-transparent data-[hover=true]:bg-transparent`}
                color="primary"
                variant="light"
                onPress={onTermsOpen}
              >
                {t.login.termsLink}
              </Button>{" "}
              {t.login.and}{" "}
              <Button
                as="span"
                className={`${typography.caption} h-auto p-0 min-w-0 bg-transparent data-[hover=true]:bg-transparent`}
                color="primary"
                variant="light"
                onPress={onPrivacyOpen}
              >
                {t.login.privacyLink}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>

      <Modal isOpen={isTermsOpen} onOpenChange={onTermsOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t.login.termsTitle}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h3 className={`${typography.h4} mb-2`}>
                      {t.login.termsSection1Title}
                    </h3>
                    <p className={typography.body}>
                      {t.login.termsSection1Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.termsSection2Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.termsSection2Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.termsSection3Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.termsSection3Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.termsSection4Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.termsSection4Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.termsSection5Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.termsSection5Content}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className={focusStates.button}
                  color="primary"
                  onPress={onClose}
                >
                  {t.common.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isPrivacyOpen} onOpenChange={onPrivacyOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t.login.privacyTitle}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.privacySection1Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.privacySection1Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.privacySection2Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.privacySection2Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.privacySection3Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.privacySection3Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.privacySection4Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.privacySection4Content}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {t.login.privacySection5Title}
                    </h3>
                    <p className="text-sm text-default-600">
                      {t.login.privacySection5Content}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className={focusStates.button}
                  color="primary"
                  onPress={onClose}
                >
                  {t.common.close}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
