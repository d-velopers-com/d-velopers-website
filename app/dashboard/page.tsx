"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";
import { countries, getCountryFlagUrl, getCountryName } from "@/lib/countries";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const {
    profile,
    loading: profileLoading,
    updatePublicStatus,
    updateProfile,
    refreshProfile,
  } = useProfile();
  const { t } = useLanguage();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [contactLink, setContactLink] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState<string>("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [englishLevel, setEnglishLevel] = useState<string>("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [countrySearchValue, setCountrySearchValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [contactLinkError, setContactLinkError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [technologiesLoading, setTechnologiesLoading] = useState(true);
  const [allowedRolesLoading, setAllowedRolesLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onOpenChange: onConfirmOpenChange,
  } = useDisclosure();
  const {
    isOpen: isSocialLinkInfoOpen,
    onOpen: onSocialLinkInfoOpen,
    onOpenChange: onSocialLinkInfoOpenChange,
  } = useDisclosure();
  const {
    isOpen: isTrialModalOpen,
    onOpen: onTrialModalOpen,
    onOpenChange: onTrialModalOpenChange,
  } = useDisclosure();
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (profile) {
      setDescription(profile.description || "");
      setLink(profile.link || "");
      setContactLink(profile.contactLinks?.[0] || "");
      setContactEmail(profile.contactEmail || "");
      setCountry(profile.country || "");
      setCountrySearchValue("");
      setName(profile.name || "");
      setTitle(profile.title || "");
      setEnglishLevel(profile.englishLevel || "");
      setAvailability(
        Array.isArray(profile.availability) ? profile.availability : [],
      );
      setTags(profile.tags || []);
    }
  }, [profile]);

  const filteredCountries = useMemo(() => {
    if (!countrySearchValue) {
      return countries;
    }
    return countries.filter((c) =>
      c.name.toLowerCase().includes(countrySearchValue.toLowerCase()),
    );
  }, [countrySearchValue]);

  const filteredTechnologies = useMemo(() => {
    const available = technologies.filter(
      (tech) =>
        tech &&
        typeof tech === "string" &&
        tech.trim().length > 0 &&
        !tags.includes(tech),
    );

    if (!searchValue) {
      return available.map((tech) => ({ value: tech, label: tech }));
    }

    return available
      .filter(
        (tech) =>
          tech && tech.toLowerCase().includes(searchValue.toLowerCase()),
      )
      .map((tech) => ({ value: tech, label: tech }));
  }, [technologies, tags, searchValue]);

  useEffect(() => {
    setTechnologiesLoading(true);
    fetch("/api/config/technologies")
      .then((res) => res.json())
      .then((data) => setTechnologies(data.technologies || []))
      .catch(() => setTechnologies([]))
      .finally(() => setTechnologiesLoading(false));
  }, []);

  useEffect(() => {
    setAllowedRolesLoading(true);
    fetch("/api/config/allowed-roles")
      .then((res) => res.json())
      .then((data) => setAllowedRoles(data.roles || []))
      .catch(() => setAllowedRoles([]))
      .finally(() => setAllowedRolesLoading(false));
  }, []);

  const handleTogglePublic = async (isPublic: boolean) => {
    const isServerMember =
      session?.user?.roles && session.user.roles.length > 0;
    const hasAllowedRole =
      isServerMember &&
      allowedRoles.length > 0 &&
      session?.user?.roles?.some((roleId) => allowedRoles.includes(roleId));
    const canApplyTrial =
      isServerMember &&
      !hasAllowedRole &&
      allowedRoles.length > 0 &&
      !profile?.profileActivatedAt;

    if (isPublic && canApplyTrial) {
      onTrialModalOpen();
      return;
    }

    const success = await updatePublicStatus(isPublic);
    if (success) {
      await refreshProfile();
    }
  };

  const handleActivateTrialPeriod = async () => {
    onTrialModalOpenChange();
    const success = await updatePublicStatus(true);
    if (success) {
      await refreshProfile();
    }
  };

  const handleCopyUrl = () => {
    if (profile?.handler) {
      const url = `${window.location.origin}/users/${profile.handler}`;

      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveProfile = () => {
    onConfirmOpen();
  };

  const confirmSaveProfile = async () => {
    onConfirmOpenChange();
    setLinkError("");
    setContactLinkError("");
    setTagsError("");

    if (link && link.trim() !== "") {
      try {
        new URL(link);
      } catch {
        setLinkError(t.dashboard.invalidUrl);

        return;
      }
    }

    if (contactLink && contactLink.trim() !== "") {
      try {
        new URL(contactLink);
      } catch {
        setContactLinkError(t.dashboard.invalidUrl);

        return;
      }
    }

    if (tags.length > 15) {
      setTagsError(t.dashboard.maxTagsError);

      return;
    }

    setSaving(true);
    const result = await updateProfile({
      description: description.trim() || null,
      link: link.trim() || null,
      contactLinks: contactLink.trim() ? [contactLink.trim()] : [],
      contactEmail: contactEmail.trim() || null,
      country: country || null,
      name: name.trim() || null,
      title: title.trim() || null,
      englishLevel: englishLevel || null,
      availability: availability,
      tags: tags,
    });

    if (result.success) {
      await refreshProfile();
      setSaving(false);
      toast.success(t.dashboard.saved, {
        duration: 2000,
      });

      return;
    } else {
      setSaving(false);
      const errorMessage =
        result.error?.includes("Maximum 15 tags") ||
        result.error?.includes("tags")
          ? t.dashboard.maxTagsError
          : result.error || t.dashboard.invalidUrl;

      if (
        result.error?.includes("Maximum 15 tags") ||
        result.error?.includes("tags")
      ) {
        setTagsError(t.dashboard.maxTagsError);
      } else {
        setLinkError(result.error || t.dashboard.errorSaving);
      }

      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  const isLoading =
    status === "loading" ||
    profileLoading ||
    technologiesLoading ||
    allowedRolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-md w-full">
          <CardBody className="gap-4 p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="rounded-full w-24 h-24" />
              <Skeleton className="rounded-lg w-48 h-6" />
              <Skeleton className="rounded-lg w-64 h-4" />
              <Skeleton className="rounded-lg w-full h-20" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  const isServerMember = user.roles && user.roles.length > 0;
  const hasAllowedRole =
    isServerMember &&
    allowedRoles.length > 0 &&
    user.roles.some((roleId) => allowedRoles.includes(roleId));

  const hasRecentActivation =
    profile?.profileActivatedAt &&
    new Date(profile.profileActivatedAt).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000;

  const canApplyTrialPeriod =
    isServerMember &&
    !hasAllowedRole &&
    allowedRoles.length > 0 &&
    !profile?.profileActivatedAt;

  const canMakePublic =
    hasAllowedRole ||
    allowedRoles.length === 0 ||
    hasRecentActivation ||
    canApplyTrialPeriod;

  const isInTrialPeriod =
    hasRecentActivation && !hasAllowedRole && allowedRoles.length > 0;

  const trialEndDate =
    profile?.profileActivatedAt &&
    new Date(
      new Date(profile.profileActivatedAt).getTime() + 30 * 24 * 60 * 60 * 1000,
    );

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/user/sync", {
        method: "POST",
      });

      if (response.ok) {
        setSyncMessage({ type: "success", text: t.dashboard.syncSuccess });
        window.location.reload();
      } else {
        setSyncMessage({ type: "error", text: t.dashboard.syncError });
      }
    } catch {
      setSyncMessage({ type: "error", text: t.dashboard.syncError });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex flex-col gap-1 items-center justify-center pt-8 pb-4">
          <Avatar
            className="w-24 h-24 ring-4 ring-primary/10"
            src={avatarUrl}
          />
          <h1 className="text-2xl font-bold mt-4">{user.username}</h1>
          {user.email && (
            <p className="text-default-500 text-sm">{user.email}</p>
          )}
        </CardHeader>

        <Divider />

        <CardBody className="gap-6 px-8 py-6">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-end">
              <Button
                color="primary"
                isLoading={syncing}
                size="sm"
                variant="flat"
                onPress={handleSync}
              >
                {syncing ? t.dashboard.syncing : t.dashboard.syncDiscord}
              </Button>
            </div>
            {syncMessage && (
              <div
                className={`flex items-center gap-2 p-2 rounded-md ${
                  syncMessage.type === "success"
                    ? "bg-success/10 border border-success/20"
                    : "bg-danger/10 border border-danger/20"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    syncMessage.type === "success"
                      ? "text-success"
                      : "text-danger"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {syncMessage.type === "success" ? (
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  ) : (
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  )}
                </svg>
                <span
                  className={`text-xs font-medium ${
                    syncMessage.type === "success"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {syncMessage.text}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {isInTrialPeriod && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1 text-success">
                    {t.dashboard.trialPeriodActive}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {t.dashboard.trialPeriodActiveDesc}
                  </p>
                  <p className="text-xs text-foreground/70 mt-2">
                    {t.dashboard.trialPeriodInstructions}{" "}
                    <a
                      href="https://www.d-velopers.com/discord"
                      className="text-info hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.dashboard.trialPeriodInstructionsLink}
                    </a>
                    .
                  </p>
                  {trialEndDate && (
                    <div className="mt-2">
                      <Chip
                        className="text-xs"
                        color="success"
                        size="sm"
                        variant="flat"
                      >
                        {t.dashboard.trialPeriodEnds}:{" "}
                        {trialEndDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Chip>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!canMakePublic &&
              isServerMember &&
              !canApplyTrialPeriod &&
              !isInTrialPeriod && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1 text-danger">
                      {t.dashboard.roleRequired}
                    </p>
                    <p className="text-xs text-foreground/70">
                      {t.dashboard.roleRequiredDesc}
                    </p>
                  </div>
                </div>
              )}

            {!profileLoading &&
              profile &&
              profile.isPublic &&
              canMakePublic && (
                <div className="flex flex-col gap-2 p-4 bg-success/10 rounded-lg border border-success/20">
                  <span className="text-xs font-semibold text-success">
                    {t.dashboard.profileUrl}
                  </span>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      classNames={{
                        input: "text-xs",
                      }}
                      size="sm"
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/users/${profile.handler}`}
                      variant="flat"
                    />
                    <Button
                      color="success"
                      size="sm"
                      variant="flat"
                      onPress={handleCopyUrl}
                    >
                      {copied ? "✓" : t.dashboard.copyUrl}
                    </Button>
                  </div>
                </div>
              )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">
                    {t.dashboard.publicProfile}
                  </span>
                  <span className="text-xs text-default-400">
                    {t.dashboard.publicProfileDesc}
                  </span>
                </div>
                {!profileLoading && profile && (
                  <div className="flex items-center gap-2">
                    {profile.isPublic && canMakePublic && (
                      <Chip color="success" size="sm" variant="dot">
                        {t.dashboard.active}
                      </Chip>
                    )}
                    <Switch
                      color="success"
                      isDisabled={!canMakePublic}
                      isSelected={!!(profile.isPublic && canMakePublic)}
                      size="sm"
                      onValueChange={handleTogglePublic}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-2" />

          {!profile?.joinedServerAt && isServerMember && (
            <div className="flex flex-col gap-3 p-4 bg-info/10 border-2 border-info/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-info flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-info mb-1">
                    {t.dashboard.syncRequired}
                  </p>
                  <p className="text-xs text-foreground/70 mb-3">
                    {t.dashboard.syncRequiredDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isServerMember && (
            <div className="flex flex-col gap-4 p-6 bg-warning/10 border-2 border-warning/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-warning flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="font-bold text-warning mb-2">
                    {t.dashboard.notServerMember}
                  </h3>
                  <p className="text-sm text-foreground/80 mb-4">
                    {t.dashboard.notServerMemberDesc}
                  </p>
                  <Button
                    as="a"
                    className="font-semibold"
                    color="warning"
                    href="https://www.youtube.com/channel/UCFKZxStYsOVrzdN_FCZ0NGg/membership"
                    rel="noopener noreferrer"
                    size="md"
                    target="_blank"
                    variant="shadow"
                  >
                    {t.dashboard.becomeMember}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t.dashboard.name}</span>
              <Input
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                maxLength={100}
                placeholder={t.dashboard.namePlaceholder}
                value={name}
                variant="bordered"
                onChange={(e) => setName(e.target.value)}
              />
              <span className="text-xs text-default-400">
                {name.length}/100 {t.dashboard.characters}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t.dashboard.title}</span>
              <Input
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                maxLength={100}
                placeholder={t.dashboard.titlePlaceholder}
                value={title}
                variant="bordered"
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="text-xs text-default-400 text-right">
                {title.length}/100 {t.dashboard.characters}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {t.dashboard.description}
              </span>
              <Textarea
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                maxLength={500}
                maxRows={6}
                placeholder={t.dashboard.descriptionPlaceholder}
                startContent={
                  <svg
                    className="w-4 h-4 text-default-400 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M4 6h16M4 12h16M4 18h7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                }
                value={description}
                variant="bordered"
                onChange={(e) => setDescription(e.target.value)}
              />
              <span className="text-xs text-default-400 text-right">
                {description.length}/500 {t.dashboard.characters}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t.dashboard.link}</span>
              <Input
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                errorMessage={linkError}
                isInvalid={!!linkError}
                placeholder={t.dashboard.linkPlaceholder}
                startContent={
                  <svg
                    className="w-4 h-4 text-default-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                }
                type="url"
                value={link}
                variant="bordered"
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {t.dashboard.socialLink}
                </span>
                <Button
                  isIconOnly
                  className="min-w-0 w-5 h-5"
                  size="sm"
                  variant="light"
                  onPress={onSocialLinkInfoOpen}
                >
                  <svg
                    className="w-4 h-4 text-default-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </Button>
              </div>
              <Input
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                errorMessage={contactLinkError}
                isInvalid={!!contactLinkError}
                placeholder={t.dashboard.socialLinkPlaceholder}
                startContent={
                  <svg
                    className="w-4 h-4 text-default-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                }
                type="url"
                value={contactLink}
                variant="bordered"
                onChange={(e) => setContactLink(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {t.dashboard.contactEmail}
              </span>
              <Input
                classNames={{
                  input: "bg-background",
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                placeholder={t.dashboard.contactEmailPlaceholder}
                startContent={
                  <svg
                    className="w-4 h-4 text-default-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                }
                type="email"
                value={contactEmail}
                variant="bordered"
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {t.dashboard.country}
              </span>
              <Autocomplete
                classNames={{
                  selectorButton:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                inputValue={
                  countrySearchValue ||
                  (country
                    ? countries.find((c) => c.code === country)?.name || ""
                    : "")
                }
                items={filteredCountries}
                placeholder={t.dashboard.countryPlaceholder}
                selectedKey={country || undefined}
                variant="bordered"
                onInputChange={(value) => {
                  setCountrySearchValue(value);
                  if (!value) {
                    setCountry("");
                  } else {
                    if (country) {
                      const selectedCountry = countries.find(
                        (c) => c.code === country,
                      );
                      if (
                        selectedCountry &&
                        !selectedCountry.name
                          .toLowerCase()
                          .startsWith(value.toLowerCase())
                      ) {
                        setCountry("");
                      }
                    }
                  }
                }}
                onSelectionChange={(key) => {
                  if (key) {
                    setCountry(key as string);
                    setCountrySearchValue("");
                  } else {
                    setCountry("");
                    setCountrySearchValue("");
                  }
                }}
                startContent={
                  country && !countrySearchValue ? (
                    <img
                      alt={getCountryName(country)}
                      className="w-5 h-4 rounded object-cover"
                      src={getCountryFlagUrl(country, "24")}
                    />
                  ) : null
                }
              >
                {(country) => (
                  <AutocompleteItem
                    key={country.code}
                    startContent={
                      <img
                        alt={country.name}
                        className="w-5 h-4 rounded object-cover"
                        src={getCountryFlagUrl(country.code, "24")}
                      />
                    }
                    textValue={country.name}
                  >
                    {country.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {t.dashboard.englishLevel}
              </span>
              <Select
                placeholder={t.dashboard.englishLevelPlaceholder}
                selectedKeys={englishLevel ? [englishLevel] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setEnglishLevel(selected || "");
                }}
              >
                <SelectItem key="A1">A1</SelectItem>
                <SelectItem key="A2">A2</SelectItem>
                <SelectItem key="B1">B1</SelectItem>
                <SelectItem key="B2">B2</SelectItem>
                <SelectItem key="C1">C1</SelectItem>
                <SelectItem key="C2">C2</SelectItem>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {t.dashboard.availability}
              </span>
              <Select
                isOpen={isAvailabilityOpen}
                selectionMode="multiple"
                placeholder={t.dashboard.availabilityPlaceholder}
                selectedKeys={availability}
                variant="bordered"
                onOpenChange={setIsAvailabilityOpen}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys) as string[];
                  // Si not_available está seleccionado, solo mantener not_available
                  if (selected.includes("not_available")) {
                    setAvailability(["not_available"]);
                    setIsAvailabilityOpen(false);
                  } else {
                    // Si se está intentando seleccionar not_available junto con otros, ignorar
                    // Si se está deseleccionando not_available, permitir otros
                    setAvailability(selected);
                    // Cerrar el select después de una selección para mejor UX
                    setTimeout(() => {
                      setIsAvailabilityOpen(false);
                    }, 100);
                  }
                }}
              >
                <SelectItem
                  key="freelance"
                  isDisabled={availability.includes("not_available")}
                >
                  {t.dashboard.availabilityFreelance}
                </SelectItem>
                <SelectItem
                  key="part_time"
                  isDisabled={availability.includes("not_available")}
                >
                  {t.dashboard.availabilityPartTime}
                </SelectItem>
                <SelectItem
                  key="full_time"
                  isDisabled={availability.includes("not_available")}
                >
                  {t.dashboard.availabilityFullTime}
                </SelectItem>
                <SelectItem
                  key="consulting"
                  isDisabled={availability.includes("not_available")}
                >
                  {t.dashboard.availabilityConsulting}
                </SelectItem>
                <SelectItem key="not_available">
                  {t.dashboard.availabilityNotAvailable}
                </SelectItem>
              </Select>
              {availability.includes("not_available") && (
                <p className="text-xs text-default-500">
                  {t.dashboard.availabilityNotAvailableDesc}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t.dashboard.tags}</span>
              <Autocomplete
                classNames={{
                  selectorButton:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                errorMessage={tagsError}
                inputValue={searchValue}
                isInvalid={!!tagsError}
                items={filteredTechnologies}
                placeholder={t.dashboard.tagsPlaceholder}
                variant="bordered"
                onInputChange={(value) => {
                  setSearchValue(value);
                  if (tagsError && value) {
                    setTagsError("");
                  }
                }}
                onSelectionChange={(key) => {
                  if (key && typeof key === "string" && key.length > 0) {
                    const selected = key;
                    if (tags.length < 15) {
                      setTagsError("");
                      setTags([...tags, selected]);
                      setSearchValue("");
                    } else {
                      setTagsError(t.dashboard.maxTagsError);
                    }
                  }
                }}
              >
                {(tech) => {
                  if (
                    !tech ||
                    !tech.value ||
                    typeof tech.value !== "string" ||
                    tech.value.trim().length === 0
                  ) {
                    return null;
                  }
                  return (
                    <AutocompleteItem key={tech.value} textValue={tech.label}>
                      {tech.label}
                    </AutocompleteItem>
                  );
                }}
              </Autocomplete>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      variant="flat"
                      onClose={() => {
                        setTags(tags.filter((t) => t !== tag));
                        setTagsError("");
                      }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-400">
                  {tags.length}/15 {t.dashboard.maxTags}
                </span>
                {tagsError && (
                  <span className="text-xs text-danger">{tagsError}</span>
                )}
              </div>
            </div>

            <Button
              className="font-semibold"
              color="primary"
              isLoading={saving}
              size="md"
              variant="shadow"
              onPress={handleSaveProfile}
            >
              {t.dashboard.save}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isTrialModalOpen} onOpenChange={onTrialModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span>{t.dashboard.canApplyTrialPeriod}</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-foreground/70">
                    {t.dashboard.canApplyTrialPeriodDesc}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {t.dashboard.trialPeriodInstructions}{" "}
                    <a
                      href="https://www.d-velopers.com/discord"
                      className="text-info hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.dashboard.trialPeriodInstructionsLink}
                    </a>
                    .
                  </p>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5 text-info"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs text-foreground/80">
                        {t.dashboard.trialPeriodNote}
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t.dashboard.cancel}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    handleActivateTrialPeriod();
                  }}
                >
                  {t.dashboard.activateTrialPeriod}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t.dashboard.confirmSaveTitle}
              </ModalHeader>
              <ModalBody>
                <p>{t.dashboard.confirmSaveMessage}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {t.dashboard.cancel}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    confirmSaveProfile();
                  }}
                >
                  {t.dashboard.confirm}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isSocialLinkInfoOpen}
        onOpenChange={onSocialLinkInfoOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t.dashboard.socialLinkInfoTitle}
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-default-600 mb-4">
                  {t.dashboard.socialLinkInfoDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip size="sm" variant="flat">
                    LinkedIn
                  </Chip>
                  <Chip size="sm" variant="flat">
                    GitHub
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Twitter/X
                  </Chip>
                  <Chip size="sm" variant="flat">
                    YouTube
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Instagram
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Discord
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Facebook
                  </Chip>
                  <Chip size="sm" variant="flat">
                    TikTok
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Twitch
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Reddit
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Telegram
                  </Chip>
                  <Chip size="sm" variant="flat">
                    WhatsApp
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Spotify
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Medium
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Behance
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Dribbble
                  </Chip>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-semibold mb-2">
                    {t.dashboard.socialLinkInfoExamples}
                  </p>
                  <ul className="text-xs text-default-500 space-y-1 list-disc list-inside">
                    <li>https://linkedin.com/in/username → &quot;My LinkedIn&quot;</li>
                    <li>https://github.com/username → &quot;My GitHub&quot;</li>
                    <li>https://x.com/username → &quot;My X&quot;</li>
                    <li>https://youtube.com/@username → &quot;My YouTube&quot;</li>
                  </ul>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onSocialLinkInfoOpenChange}>
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
