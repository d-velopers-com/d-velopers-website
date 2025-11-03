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
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing.
                </p>
                <p>
                  Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit
                  duis sit officia eiusmod Lorem aliqua enim laboris do dolor
                  eiusmod. Et mollit incididunt nisi consectetur esse laborum
                  eiusmod pariatur.
                </p>
                <p>
                  Duis anim sweet dispirulo parla nom de tabera quick ad est
                  gracilis at vendra. Qui marin nostrud qui a qui parla dori
                  officia consequat laboris amet in dolor duis.
                </p>
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
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing.
                </p>
                <p>
                  Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit
                  duis sit officia eiusmod Lorem aliqua enim laboris do dolor
                  eiusmod. Et mollit incididunt nisi consectetur esse laborum
                  eiusmod pariatur.
                </p>
                <p>
                  Duis anim sweet dispirulo parla nom de tabera quick ad est
                  gracilis at vendra. Qui marin nostrud qui a qui parla dori
                  officia consequat laboris amet in dolor duis.
                </p>
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
