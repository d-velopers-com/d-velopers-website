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
import { Tooltip } from "@heroui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";
import { countries, getCountryFlagUrl, getCountryName } from "@/lib/countries";
import { CountrySelect } from "@/components/country-select";
import {
  cardStyles,
  typography,
  iconSizes,
  stateColors,
  avatarStyles,
  focusStates,
  spacing,
  chipStyles,
  colors,
  colorOpacity,
} from "@/lib/ui-constants";

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
  const [isNotAvailable, setIsNotAvailable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [contactLinkError, setContactLinkError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [titleError, setTitleError] = useState("");
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
      setName(profile.name || "");
      setTitle(profile.title || "");
      setEnglishLevel(profile.englishLevel || "");
      const profileAvailability = Array.isArray(profile.availability)
        ? profile.availability
        : [];
      const hasNotAvailable = profileAvailability.includes("not_available");
      setIsNotAvailable(hasNotAvailable);
      if (hasNotAvailable) {
        setAvailability([]);
      } else {
        setAvailability(profileAvailability);
      }
      setTags(profile.tags || []);
    }
  }, [profile]);

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
    setTitleError("");

    if (title.trim().length > 80) {
      setTitleError(
        t.dashboard.titleMaxLengthError ||
          "Title must be 80 characters or less",
      );
      toast.error(
        t.dashboard.titleMaxLengthError ||
          "Title must be 80 characters or less",
      );

      return;
    }

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
      availability: isNotAvailable ? ["not_available"] : availability,
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
              <Skeleton className="rounded-full w-24 h-24 shimmer" />
              <Skeleton className="rounded-lg w-48 h-6 shimmer" />
              <Skeleton className="rounded-lg w-64 h-4 shimmer" />
              <Skeleton className="rounded-lg w-full h-20 shimmer" />
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
      <Card className={`max-w-2xl w-full ${cardStyles.base}`}>
        <CardHeader
          className={`flex flex-col ${spacing.sm} items-center justify-center pt-8 pb-4`}
        >
          <Avatar
            className={`w-24 h-24 ${avatarStyles.ringLarge}`}
            src={avatarUrl}
          />
          <h1 className={`${typography.h2} mt-4`}>{user.username}</h1>
          {user.email && (
            <p className={`${typography.body} text-default-500`}>
              {user.email}
            </p>
          )}
        </CardHeader>

        <Divider />

        <CardBody className={`${spacing.lg} px-8 py-6`}>
          <div className={`flex flex-col ${spacing.sm} mb-4`}>
            <div className="flex justify-end">
              <Tooltip
                content={
                  t.dashboard.syncDiscordTooltip ||
                  "Sync your profile data from Discord"
                }
              >
                <Button
                  className={focusStates.button}
                  color="primary"
                  isLoading={syncing}
                  size="sm"
                  variant="flat"
                  onPress={handleSync}
                >
                  {syncing ? t.dashboard.syncing : t.dashboard.syncDiscord}
                </Button>
              </Tooltip>
            </div>
            {syncMessage && (
              <div
                className={`flex items-center ${spacing.sm} p-2 rounded-md ${
                  syncMessage.type === "success"
                    ? stateColors.success.full
                    : stateColors.danger.full
                }`}
              >
                <svg
                  className={`${iconSizes.sm} ${
                    syncMessage.type === "success"
                      ? stateColors.success.text
                      : stateColors.danger.text
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
                  className={`${typography.caption} font-medium ${
                    syncMessage.type === "success"
                      ? stateColors.success.text
                      : stateColors.danger.text
                  }`}
                >
                  {syncMessage.text}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {isInTrialPeriod && (
              <div
                className={`flex items-start ${spacing.sm} p-3 rounded-lg ${stateColors.success.full}`}
              >
                <svg
                  className={`${iconSizes.md} flex-shrink-0 mt-0.5 ${stateColors.success.text}`}
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
                  <p
                    className={`${typography.body} font-semibold mb-1 ${stateColors.success.text}`}
                  >
                    {t.dashboard.trialPeriodActive}
                  </p>
                  <p className={`${typography.caption} text-foreground/70`}>
                    {t.dashboard.trialPeriodActiveDesc}
                  </p>
                  <p
                    className={`${typography.caption} text-foreground/70 mt-2`}
                  >
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
                        className={chipStyles.base}
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
                <div
                  className={`flex items-start ${spacing.sm} p-3 rounded-lg ${stateColors.danger.full}`}
                >
                  <svg
                    className={`${iconSizes.md} flex-shrink-0 mt-0.5 ${stateColors.danger.text}`}
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
                    <p
                      className={`${typography.body} font-semibold mb-1 ${stateColors.danger.text}`}
                    >
                      {t.dashboard.roleRequired}
                    </p>
                    <p className={`${typography.caption} text-foreground/70`}>
                      {t.dashboard.roleRequiredDesc}
                    </p>
                  </div>
                </div>
              )}

            {!profileLoading &&
              profile &&
              profile.isPublic &&
              canMakePublic && (
                <div
                  className={`flex flex-col ${spacing.sm} p-4 ${stateColors.success.full} rounded-lg`}
                >
                  <span
                    className={`${typography.caption} font-semibold ${stateColors.success.text}`}
                  >
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
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.3, type: "spring" }}
                        >
                          <Button
                            className={focusStates.button}
                            color="success"
                            size="sm"
                            variant="flat"
                          >
                            <svg
                              className="w-4 h-4 checkmark-animated"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            className={focusStates.button}
                            color="success"
                            size="sm"
                            variant="flat"
                            onPress={handleCopyUrl}
                          >
                            {t.dashboard.copyUrl}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className={typography.label}>
                    {t.dashboard.publicProfile}
                  </span>
                  <span className={typography.captionMuted}>
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
            <div
              className={`flex flex-col ${spacing.md} p-4 ${stateColors.info.full} rounded-lg`}
            >
              <div className={`flex items-start ${spacing.md}`}>
                <svg
                  className={`${iconSizes.md} ${stateColors.info.text} flex-shrink-0 mt-0.5`}
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
                  <p
                    className={`${typography.body} font-semibold ${stateColors.info.text} mb-1`}
                  >
                    {t.dashboard.syncRequired}
                  </p>
                  <p
                    className={`${typography.caption} text-foreground/70 mb-3`}
                  >
                    {t.dashboard.syncRequiredDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isServerMember && (
            <div
              className={`flex flex-col ${spacing.md} p-6 ${stateColors.warning.full} rounded-lg`}
            >
              <div className={`flex items-start ${spacing.md}`}>
                <svg
                  className={`${iconSizes.lg} ${stateColors.warning.text} flex-shrink-0 mt-0.5`}
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
                  <h3
                    className={`${typography.h3} ${stateColors.warning.text} mb-2`}
                  >
                    {t.dashboard.notServerMember}
                  </h3>
                  <p className={`${typography.body} text-foreground/80 mb-4`}>
                    {t.dashboard.notServerMemberDesc}
                  </p>
                  <Button
                    as="a"
                    className={`font-semibold ${focusStates.button}`}
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
              <span className={typography.label}>{t.dashboard.name}</span>
              <Input
                classNames={{
                  input: `bg-background ${typography.input}`,
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                maxLength={100}
                placeholder={t.dashboard.namePlaceholder}
                value={name}
                variant="bordered"
                onChange={(e) => setName(e.target.value)}
              />
              <span className={typography.captionMuted}>
                {name.length}/100 {t.dashboard.characters}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>{t.dashboard.title}</span>
              <Input
                classNames={{
                  input: `bg-background ${typography.input}`,
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                errorMessage={titleError}
                isInvalid={!!titleError || title.length > 80}
                maxLength={80}
                placeholder={t.dashboard.titlePlaceholder}
                value={title}
                variant="bordered"
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError("");
                }}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`${typography.captionMuted} ${title.length > 80 ? "text-danger" : ""}`}
                >
                  {title.length > 80
                    ? t.dashboard.titleMaxLengthError ||
                      "Title must be 80 characters or less"
                    : ""}
                </span>
                <span
                  className={`${typography.captionMuted} ${title.length > 80 ? "text-danger" : ""}`}
                >
                  {title.length}/80 {t.dashboard.characters}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>
                {t.dashboard.description}
              </span>
              <Textarea
                classNames={{
                  input: `bg-background ${typography.input}`,
                  inputWrapper:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
                maxLength={500}
                maxRows={6}
                placeholder={t.dashboard.descriptionPlaceholder}
                startContent={
                  <svg
                    className={`${iconSizes.sm} ${colors.text.muted} flex-shrink-0 mt-1`}
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
              <span className={`${typography.captionMuted} text-right`}>
                {description.length}/500 {t.dashboard.characters}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>{t.dashboard.link}</span>
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
                <span className={typography.label}>
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
              <span className={typography.label}>
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
              <span className={typography.label}>{t.dashboard.country}</span>
              <CountrySelect
                value={country}
                onChange={setCountry}
                placeholder={t.dashboard.countryPlaceholder}
                variant="bordered"
                label=""
                ariaLabel={t.dashboard.countryPlaceholder}
                classNames={{
                  selectorButton:
                    "bg-background hover:bg-background group-data-[focus=true]:bg-background",
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>
                {t.dashboard.englishLevel}
              </span>
              <Select
                aria-label={t.dashboard.englishLevelPlaceholder}
                placeholder={t.dashboard.englishLevelPlaceholder}
                selectedKeys={englishLevel ? [englishLevel] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setEnglishLevel(selected || "");
                }}
              >
                {t.dashboard.englishLevels.map((level) => (
                  <SelectItem key={level.key}>{level.text}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>
                {t.dashboard.availability}
              </span>
              <div className="flex items-center gap-3 p-2 bg-default-50 dark:bg-default-100/10 rounded-lg w-fit">
                <Switch
                  isSelected={isNotAvailable}
                  onValueChange={(value) => {
                    setIsNotAvailable(value);
                    if (value) {
                      setAvailability([]);
                    } else if (availability.length === 0) {
                      setAvailability(["freelance"]);
                    }
                  }}
                  color="primary"
                  size="sm"
                />
                <div className="flex flex-col gap-0.5">
                  <span className={typography.labelSmall}>
                    {t.dashboard.availabilityNotAvailable}
                  </span>
                  <span className={typography.caption}>
                    {t.dashboard.availabilityNotAvailableDesc}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isNotAvailable) {
                      setAvailability((prev) =>
                        prev.includes("freelance")
                          ? prev.filter((item) => item !== "freelance")
                          : [...prev, "freelance"],
                      );
                    }
                  }}
                  disabled={isNotAvailable}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    isNotAvailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-disabled={isNotAvailable}
                >
                  <Chip
                    color={
                      availability.includes("freelance") ? "primary" : "default"
                    }
                    variant={
                      availability.includes("freelance") ? "solid" : "flat"
                    }
                  >
                    {t.dashboard.availabilityFreelance}
                  </Chip>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isNotAvailable) {
                      setAvailability((prev) =>
                        prev.includes("part_time")
                          ? prev.filter((item) => item !== "part_time")
                          : [...prev, "part_time"],
                      );
                    }
                  }}
                  disabled={isNotAvailable}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    isNotAvailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-disabled={isNotAvailable}
                >
                  <Chip
                    color={
                      availability.includes("part_time") ? "primary" : "default"
                    }
                    variant={
                      availability.includes("part_time") ? "solid" : "flat"
                    }
                  >
                    {t.dashboard.availabilityPartTime}
                  </Chip>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isNotAvailable) {
                      setAvailability((prev) =>
                        prev.includes("full_time")
                          ? prev.filter((item) => item !== "full_time")
                          : [...prev, "full_time"],
                      );
                    }
                  }}
                  disabled={isNotAvailable}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    isNotAvailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-disabled={isNotAvailable}
                >
                  <Chip
                    color={
                      availability.includes("full_time") ? "primary" : "default"
                    }
                    variant={
                      availability.includes("full_time") ? "solid" : "flat"
                    }
                  >
                    {t.dashboard.availabilityFullTime}
                  </Chip>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isNotAvailable) {
                      setAvailability((prev) =>
                        prev.includes("consulting")
                          ? prev.filter((item) => item !== "consulting")
                          : [...prev, "consulting"],
                      );
                    }
                  }}
                  disabled={isNotAvailable}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    isNotAvailable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-disabled={isNotAvailable}
                >
                  <Chip
                    color={
                      availability.includes("consulting")
                        ? "primary"
                        : "default"
                    }
                    variant={
                      availability.includes("consulting") ? "solid" : "flat"
                    }
                  >
                    {t.dashboard.availabilityConsulting}
                  </Chip>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className={typography.label}>{t.dashboard.tags}</span>
              <Autocomplete
                aria-label={t.dashboard.tags}
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
                <span className={typography.captionMuted}>
                  {tags.length}/15 {t.dashboard.maxTags}
                </span>
                {tagsError && (
                  <span
                    className={`${typography.caption} ${stateColors.danger.text}`}
                  >
                    {tagsError}
                  </span>
                )}
              </div>
            </div>

            <Button
              className={`font-semibold ${focusStates.button}`}
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
                  <p className={`${typography.body} text-foreground/70`}>
                    {t.dashboard.canApplyTrialPeriodDesc}
                  </p>
                  <p className={`${typography.body} text-foreground/70`}>
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
                  <div
                    className={`flex items-start ${spacing.sm} p-3 rounded-lg ${stateColors.info.full}`}
                  >
                    <svg
                      className={`${iconSizes.md} flex-shrink-0 mt-0.5 ${stateColors.info.text}`}
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
                      <p
                        className={`${typography.caption} ${colorOpacity.fg80}`}
                      >
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
                <p className={`${typography.body} mb-4`}>
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
                  <p className={`${typography.label} mb-2`}>
                    {t.dashboard.socialLinkInfoExamples}
                  </p>
                  <ul
                    className={`${typography.caption} space-y-1 list-disc list-inside`}
                  >
                    <li>
                      https://linkedin.com/in/username → &quot;My LinkedIn&quot;
                    </li>
                    <li>https://github.com/username → &quot;My GitHub&quot;</li>
                    <li>https://x.com/username → &quot;My X&quot;</li>
                    <li>
                      https://youtube.com/@username → &quot;My YouTube&quot;
                    </li>
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
