"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

import { useLanguage } from "@/contexts/language-context";
import { useSession } from "@/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";

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
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [linkError, setLinkError] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (profile) {
      setDescription(profile.description || "");
      setLink(profile.link || "");
      setName(profile.name || "");
      setTitle(profile.title || "");
      setTags(profile.tags || []);
    }
  }, [profile]);

  useEffect(() => {
    fetch("/api/config/technologies")
      .then((res) => res.json())
      .then((data) => setTechnologies(data.technologies || []))
      .catch(() => setTechnologies([]));
  }, []);

  useEffect(() => {
    fetch("/api/config/allowed-roles")
      .then((res) => res.json())
      .then((data) => setAllowedRoles(data.roles || []))
      .catch(() => setAllowedRoles([]));
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

  const handleSaveProfile = async () => {
    setLinkError("");
    setSaveMessage("");

    if (link && link.trim() !== "") {
      try {
        new URL(link);
      } catch {
        setLinkError(t.dashboard.invalidUrl);

        return;
      }
    }

    setSaving(true);
    const result = await updateProfile({
      description: description.trim() || null,
      link: link.trim() || null,
      name: name.trim() || null,
      title: title.trim() || null,
      tags: tags,
    });

    if (result.success) {
      setSaveMessage(t.dashboard.saved);

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
          setTimeout(() => setSaveMessage(""), 3000);
        }
      } catch {
        // If sync fails, still show success message for profile save
        setSaving(false);
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } else {
      setSaving(false);
      setLinkError(result.error || "Error saving");
    }
  };

  if (status === "loading") {
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
  const canMakePublic = hasAllowedRole || allowedRoles.length === 0;

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
          {profile?.joinedServerAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-default-500">
                {t.dashboard.joinedServer}
              </span>
              <span className="text-sm">
                {new Date(profile.joinedServerAt).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
          )}

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

          {isServerMember && <Divider className="my-2" />}

          <div className="bg-default-50 dark:bg-default-100/20 rounded-lg p-6 border-2 border-dashed border-default-200 dark:border-default-100/30">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <h2 className="text-base font-bold">
                {t.dashboard.editPublicProfile}
              </h2>
            </div>
            <p className="text-xs text-default-500 mb-6">
              {t.dashboard.editPublicProfileDesc}
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  {t.dashboard.name}
                </span>
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
                <span className="text-xs text-default-400 text-right">
                  {name.length}/100 {t.dashboard.characters}
                </span>
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
                  {t.dashboard.tags}
                </span>
                <Select
                  classNames={{
                    trigger: "bg-background",
                  }}
                  placeholder={t.dashboard.tagsPlaceholder}
                  selectedKeys={tags}
                  selectionMode="multiple"
                  variant="bordered"
                  onSelectionChange={(keys) =>
                    setTags(Array.from(keys) as string[])
                  }
                >
                  {technologies.map((tech) => (
                    <SelectItem key={tech}>{tech}</SelectItem>
                  ))}
                </Select>
                <span className="text-xs text-default-400 text-right">
                  {tags.length}/15 {t.dashboard.maxTags}
                </span>
              </div>

              {saveMessage && (
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <svg
                    className="w-5 h-5 text-success"
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
                  <span className="text-sm font-medium text-success">
                    {saveMessage}
                  </span>
                </div>
              )}

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
          </div>

          <Divider className="my-2" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {t.dashboard.publicProfile}
                  </span>
                  {!profileLoading && profile?.isPublic && canMakePublic && (
                    <Chip color="success" size="sm" variant="dot">
                      {t.dashboard.active}
                    </Chip>
                  )}
                </div>
                <span className="text-xs text-default-400">
                  {t.dashboard.publicProfileDesc}
                </span>
              </div>
              {!profileLoading && profile && (
                <Switch
                  color="success"
                  isDisabled={!canMakePublic}
                  isSelected={profile.isPublic && canMakePublic}
                  onValueChange={handleTogglePublic}
                />
              )}
            </div>

            {!canMakePublic && isServerMember && (
              <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-danger flex-shrink-0 mt-0.5"
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
                  <p className="text-sm font-semibold text-danger mb-1">
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
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
