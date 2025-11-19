"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { useLanguage } from "@/contexts/language-context";
import { DiscordIconLarge } from "@/components/discord-icon";
import { useSession } from "@/hooks/useSession";

export default function LoginPage() {
  const { status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

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
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/login";
  };

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-1 items-center justify-center pt-8 pb-4">
          <h1 className="text-3xl font-bold">{t.login.title}</h1>
          <p className="text-default-500 text-center">{t.login.subtitle}</p>
        </CardHeader>

        <CardBody className="px-8 py-6">
          <Button
            className="bg-[#5865F2] hover:bg-[#4752C4] w-full"
            color="primary"
            size="lg"
            startContent={<DiscordIconLarge size={24} />}
            onPress={handleDiscordLogin}
          >
            {t.login.discordButton}
          </Button>
        </CardBody>

        <Divider />

        <CardFooter className="px-8 py-6">
          <p className="text-xs text-default-400 text-center w-full">
            {t.login.terms}{" "}
            <Button
              as="span"
              className="text-xs h-auto p-0 min-w-0 bg-transparent data-[hover=true]:bg-transparent"
              color="primary"
              variant="light"
              onPress={onTermsOpen}
            >
              {t.login.termsLink}
            </Button>{" "}
            {t.login.and}{" "}
            <Button
              as="span"
              className="text-xs h-auto p-0 min-w-0 bg-transparent data-[hover=true]:bg-transparent"
              color="primary"
              variant="light"
              onPress={onPrivacyOpen}
            >
              {t.login.privacyLink}
            </Button>
          </p>
        </CardFooter>
      </Card>

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
                    <h3 className="font-semibold mb-2">
                      {t.login.termsSection1Title}
                    </h3>
                    <p className="text-sm text-default-600">
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
                <Button color="primary" onPress={onClose}>
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
                <Button color="primary" onPress={onClose}>
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
