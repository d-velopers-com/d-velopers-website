"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState<string>("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [countrySearchValue, setCountrySearchValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState("");
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (profile) {
      setDescription(profile.description || "");
      setLink(profile.link || "");
      setContactEmail(profile.contactEmail || "");
      setCountry(profile.country || "");
      setCountrySearchValue("");
      setName(profile.name || "");
      setTitle(profile.title || "");
      setTags(profile.tags || []);
    }
  }, [profile]);

  const filteredCountries = useMemo(() => {
    if (!countrySearchValue) {
      return countries;
    }
    return countries.filter((c) =>
      c.name.toLowerCase().includes(countrySearchValue.toLowerCase())
    );
  }, [countrySearchValue]);

  const filteredTechnologies = useMemo(() => {
    // Filtrar tecnologías que ya están en tags y valores inválidos
    const available = technologies.filter(
      (tech) => 
        tech && 
        typeof tech === "string" && 
        tech.trim().length > 0 && 
        !tags.includes(tech)
    );
    
    if (!searchValue) {
      // Convertir strings a objetos para que Autocomplete funcione
      return available.map((tech) => ({ value: tech, label: tech }));
    }
    
    // Filtrar y convertir a objetos
    return available
      .filter((tech) =>
        tech && tech.toLowerCase().includes(searchValue.toLowerCase())
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
    await updatePublicStatus(isPublic);
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
    setTagsError("");

    if (link && link.trim() !== "") {
      try {
        new URL(link);
      } catch {
        setLinkError(t.dashboard.invalidUrl);

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
      contactEmail: contactEmail.trim() || null,
      country: country || null,
      name: name.trim() || null,
      title: title.trim() || null,
      tags: tags,
    });

    if (result.success) {
      // Sync with Discord after saving
      try {
        const syncResponse = await fetch("/api/user/sync", {
          method: "POST",
        });

        if (syncResponse.ok) {
          // Refresh profile data without reloading page
          await refreshProfile();
          setSaving(false);
        } else {
          // If sync fails, still show success message for profile save
          setSaving(false);
        }
      } catch {
        // If sync fails, still show success message for profile save
        setSaving(false);
      }
    } else {
      setSaving(false);
      // Check if error is about tags
      if (
        result.error?.includes("Maximum 15 tags") ||
        result.error?.includes("tags")
      ) {
        setTagsError(t.dashboard.maxTagsError);
      } else {
        setLinkError(result.error || "Error saving");
      }
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

  // Puede aplicar al período de prueba si no tiene rol permitido, hay roles requeridos,
  // no ha activado el perfil aún, y es miembro del servidor
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
          <div className="flex flex-col gap-4">
            {canApplyTrialPeriod && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5 text-info"
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
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1 text-info">
                    {t.dashboard.canApplyTrialPeriod}
                  </p>
                  <p className="text-xs text-foreground/70 mb-3">
                    {t.dashboard.canApplyTrialPeriodDesc}
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => handleTogglePublic(true)}
                  >
                    {t.dashboard.activateTrialPeriod}
                  </Button>
                </div>
              </div>
            )}

            {!canMakePublic && isServerMember && !canApplyTrialPeriod && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  isInTrialPeriod
                    ? "bg-warning/10 border border-warning/20"
                    : "bg-danger/10 border border-danger/20"
                }`}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isInTrialPeriod ? "text-warning" : "text-danger"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isInTrialPeriod ? (
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  ) : (
                    <path
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  )}
                </svg>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      isInTrialPeriod ? "text-warning" : "text-danger"
                    }`}
                  >
                    {isInTrialPeriod
                      ? t.dashboard.trialPeriod
                      : t.dashboard.roleRequired}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {isInTrialPeriod
                      ? t.dashboard.trialPeriodDesc
                      : t.dashboard.roleRequiredDesc}
                  </p>
                  {isInTrialPeriod && trialEndDate && (
                    <div className="mt-3 pt-3 border-t border-warning/20">
                      <p className="text-xs text-foreground/70 mb-2">
                        {t.dashboard.trialPeriodNote}
                      </p>
                      <Chip
                        className="text-xs"
                        color="warning"
                        size="sm"
                        variant="flat"
                      >
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

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {t.dashboard.name}
              </span>
              {!profileLoading && profile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-default-400">
                    {t.dashboard.publicProfile}
                  </span>
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
                  <Button
                    color="primary"
                    isLoading={syncing}
                    size="sm"
                    variant="flat"
                    onPress={handleSync}
                  >
                    {syncing ? t.dashboard.syncing : t.dashboard.syncProfile}
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-default-400">
                    {name.length}/100 {t.dashboard.characters}
                  </span>
                  <span className="text-xs text-default-400">
                    {t.dashboard.publicProfileDesc}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  {t.dashboard.title}
                </span>
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
                <span className="text-sm font-semibold">
                  {t.dashboard.link}
                </span>
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
                  inputValue={countrySearchValue || (country ? countries.find((c) => c.code === country)?.name || "" : "")}
                  items={filteredCountries}
                  placeholder={t.dashboard.countryPlaceholder}
                  selectedKey={country || undefined}
                  variant="bordered"
                  onInputChange={(value) => {
                    setCountrySearchValue(value);
                    if (!value) {
                      setCountry("");
                    } else {
                      // Si el usuario está escribiendo y el valor no coincide con el país seleccionado, limpiar la selección
                      if (country) {
                        const selectedCountry = countries.find((c) => c.code === country);
                        if (selectedCountry && !selectedCountry.name.toLowerCase().startsWith(value.toLowerCase())) {
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
                  ) : null}
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
                  {t.dashboard.tags}
                </span>
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
                    if (!tech || !tech.value || typeof tech.value !== "string" || tech.value.trim().length === 0) {
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
    </div>
  );
}
