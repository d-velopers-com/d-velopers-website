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
                {t.login.termsLink}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                    <p className="text-sm text-default-600">
                      By accessing and using this platform, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. User Account</h3>
                    <p className="text-sm text-default-600">
                      You are responsible for maintaining the security of your account. You must not share your account credentials with others or use another user&apos;s account.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. User Conduct</h3>
                    <p className="text-sm text-default-600">
                      You agree to use the platform in a lawful manner and not to engage in any activity that could harm, disable, or impair the service or interfere with other users&apos; access.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4. Content</h3>
                    <p className="text-sm text-default-600">
                      You retain ownership of any content you post. By posting content, you grant us a license to use, display, and distribute it on our platform.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">5. Termination</h3>
                    <p className="text-sm text-default-600">
                      We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in harmful behavior.
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
                {t.login.privacyLink}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. Information We Collect</h3>
                    <p className="text-sm text-default-600">
                      We collect information you provide directly, such as your Discord username, email, and profile information. We also collect data about how you use our platform.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
                    <p className="text-sm text-default-600">
                      We use your information to provide and improve our services, authenticate your account, and communicate with you about your account and our services.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Information Sharing</h3>
                    <p className="text-sm text-default-600">
                      We do not sell your personal information. We may share your information only with your consent, to comply with legal obligations, or to protect our rights.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">4. Data Security</h3>
                    <p className="text-sm text-default-600">
                      We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">5. Your Rights</h3>
                    <p className="text-sm text-default-600">
                      You have the right to access, update, or delete your personal information. You can manage your account settings or contact us to exercise these rights.
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
