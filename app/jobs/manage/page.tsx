"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useEffect, useState, useCallback, useMemo } from "react";
import { SkeletonLoading } from "@/components/skeleton-loading";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Switch } from "@heroui/switch";
import { Tabs, Tab } from "@heroui/tabs";
import { focusStates, stateColors, typography } from "@/lib/ui-constants";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { useLanguage } from "@/contexts/language-context";
import { generateEmbed, isUrl, detectPlatform, type SupportedPlatform } from "@/lib/embed-generator";
import { Avatar } from "@heroui/avatar";
import { getDiscordAvatarUrl } from "@/shared/lib";

interface PostAuthor {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
}

interface Post {
  id: string;
  title: string;
  iframe: string;
  sourceUrl?: string | null;
  embeddable?: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy?: PostAuthor | null;
  createdAt: string;
  updatedAt: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

import { memo } from "react";

interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

/**
 * Job Card Preview - matches the card style from jobs page
 */
const JobCardPreview = memo(function JobCardPreview({
  html,
  title,
  sourceUrl,
  embeddable
}: {
  html: string;
  title: string;
  sourceUrl: string;
  embeddable: boolean;
}) {
  const [ogData, setOgData] = useState<OGMetadata | null>(null);
  const [isLoadingOG, setIsLoadingOG] = useState(false);

  // Detect platform
  const platform = useMemo(() => {
    const url = sourceUrl.toLowerCase();
    if (url.includes("linkedin.com")) return "linkedin";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    return "unknown";
  }, [sourceUrl]);

  // For LinkedIn, check if it's a valid embed URL
  const isLinkedInEmbeddable = useMemo(() => {
    if (platform !== "linkedin") return true;
    const srcMatch = html.match(/src=["']([^"']+)["']/);
    const src = srcMatch ? srcMatch[1] : null;
    return src && src.includes('linkedin.com/embed');
  }, [platform, html]);

  // Fetch OG data for non-embeddable content
  useEffect(() => {
    const shouldFetchOG = !embeddable || (platform !== "linkedin" && platform !== "twitter");
    if (shouldFetchOG && sourceUrl && !ogData) {
      setIsLoadingOG(true);
      fetch(`/api/og-metadata?url=${encodeURIComponent(sourceUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setOgData(data);
          }
        })
        .catch(() => { })
        .finally(() => setIsLoadingOG(false));
    }
  }, [embeddable, sourceUrl, ogData, platform]);

  // Render LinkedIn fallback
  const { t } = useLanguage();
  const renderLinkedInFallback = () => (
    <div className="w-full px-5 py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </div>
        <p className="text-default-500 text-sm text-center">{t.jobs.embed?.cannotBeEmbedded || "This post cannot be embedded"}</p>
        <span className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#0A66C2] text-white text-sm font-semibold">
          {t.jobs.embed?.openInLinkedIn || "Open in LinkedIn"}
        </span>
      </div>
    </div>
  );

  // Render OG fallback for generic URLs
  const renderOGFallback = () => (
    <div className="w-full px-5 py-6">
      <div className="block rounded-xl overflow-hidden border border-default-200 bg-default-50">
        {isLoadingOG ? (
          <Skeleton className="w-full h-48" />
        ) : ogData?.image ? (
          <div className="w-full h-48 overflow-hidden">
            <img src={ogData.image} alt={ogData.title || "Preview"} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        )}
        <div className="p-4">
          {isLoadingOG ? (
            <>
              <Skeleton className="h-5 w-3/4 mb-2 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </>
          ) : (
            <>
              <h4 className="font-semibold text-foreground line-clamp-2 mb-1">{ogData?.title || sourceUrl}</h4>
              {ogData?.description && <p className="text-sm text-default-500 line-clamp-2">{ogData.description}</p>}
              <div className="flex items-center gap-2 mt-3 text-xs text-default-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>{ogData?.siteName || new URL(sourceUrl).hostname}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Determine what to render in body
  const renderBody = () => {
    if (platform === "linkedin") {
      if (!embeddable || !isLinkedInEmbeddable) {
        return renderLinkedInFallback();
      }
      return <div className="w-full flex justify-center p-4" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (platform === "twitter") {
      // Twitter embeds work, show the iframe
      return <div className="w-full flex justify-center p-4" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    // For unknown/generic URLs, always show OG fallback in preview
    // because we can't know if it's embeddable until server-side validation
    return renderOGFallback();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-4 border-b border-default-200">
        <h3 className="text-sm font-semibold text-foreground truncate flex-1">
          {title || "Untitled Post"}
        </h3>
        <Chip size="sm" variant="flat" color="default" className="text-xs font-medium flex-shrink-0">
          Preview
        </Chip>
      </CardHeader>
      <CardBody className="p-0 flex flex-col justify-center items-center overflow-hidden bg-default-50">
        {renderBody()}
      </CardBody>
    </Card>
  );
});

export default function ManageJobPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [hasJobManagementRole, setHasJobManagementRole] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", iframe: "", embeddable: true });
  const [urlInput, setUrlInput] = useState("");
  const [embedPreview, setEmbedPreview] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);

  const [detectedPlatform, setDetectedPlatform] = useState<SupportedPlatform | null>(null);
  const [idForDelete, setIdForDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [autoApproveEnabled, setAutoApproveEnabled] = useState<boolean>(false);
  const [isTogglingAutoApprove, setIsTogglingAutoApprove] = useState(false);

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

  // Handle redirect when user doesn't have job management role
  useEffect(() => {
    if (!isLoading && !hasJobManagementRole && session?.user) {
      setShouldRedirect(true);
    }
  }, [isLoading, hasJobManagementRole, session]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/');
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (status === "unauthenticated" || !session?.user?.roles) {
      return;
    }

    // Fetch both staff and collaborator roles
    Promise.all([
      fetch("/api/config/staff-roles").then(res => res.json()),
      fetch("/api/config/collaborator-roles").then(res => res.json()).catch(() => ({ roles: [] }))
    ]).then(([staffData, collabData]) => {
      const staffRoles = staffData.roles || [];
      const collabRoles = collabData.roles || [];
      const userRoles = session?.user?.roles || [];

      const userIsStaff = userRoles.some((role) => staffRoles.includes(role));
      const userIsCollab = userRoles.some((role) => collabRoles.includes(role));

      setIsStaff(userIsStaff);
      setHasJobManagementRole(userIsStaff || userIsCollab);

      if (userIsStaff || userIsCollab) {
        fetchPosts();
        // Fetch auto-approve setting for staff
        if (userIsStaff) {
          fetchAutoApproveSetting();
        }
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      setHasJobManagementRole(false);
      setIsLoading(false);
    });
  }, [session, status]);

  const fetchAutoApproveSetting = async () => {
    try {
      const res = await fetch("/api/config/auto-approve");
      if (res.ok) {
        const data = await res.json();
        setAutoApproveEnabled(data.enabled);
      }
    } catch (err) {
      console.error("Failed to fetch auto-approve setting");
    }
  };

  const handleAutoApproveToggle = async (enabled: boolean) => {
    setIsTogglingAutoApprove(true);
    try {
      const res = await fetch("/api/config/auto-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        throw new Error("Failed to update setting");
      }

      setAutoApproveEnabled(enabled);
      toast.success(
        enabled
          ? t.jobManage.autoApprove?.enabled || "Auto-approve enabled for bot posts"
          : t.jobManage.autoApprove?.disabled || "Auto-approve disabled for bot posts"
      );
    } catch (err) {
      toast.error(t.jobManage.autoApprove?.error || "Failed to update auto-approve setting");
    } finally {
      setIsTogglingAutoApprove(false);
    }
  };

  const fetchPosts = async (page: number = 1) => {
    try {
      let url = `/api/posts/manage?page=${page}&limit=10`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter.toUpperCase()}`;
      }
      const res = await fetch(url);
      const data: PostsResponse = await res.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(t.jobManage.getting.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.iframe) {
      toast.error(t.jobManage.validation);
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/posts/${editingId}` : "/api/posts";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourceUrl: urlInput, // Save original URL
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t.jobManage.save.errorMessage);
      }

      toast.success(editingId ? t.jobManage.save.updatedSuccessMessage : t.jobManage.save.saveSuccessMessage);
      // Clear all form state
      setFormData({ title: "", iframe: "", embeddable: true });
      setUrlInput("");
      setEmbedPreview(null);
      setEmbedError(null);
      setDetectedPlatform(null);
      setEditingId(null);
      setIsCreating(false);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.jobManage.save.errorMessage);
    }
  };

  const handleEdit = (post: Post) => {
    setFormData({ title: post.title, iframe: post.iframe, embeddable: post.embeddable ?? true });
    // Show sourceUrl if available, otherwise show iframe
    setUrlInput(post.sourceUrl || post.iframe);
    setEmbedPreview(post.iframe);
    setEmbedError(null);
    setDetectedPlatform(null);
    setEditingId(post.id);
    setIsCreating(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    setIdForDelete(id);
    onConfirmOpen();
  };

  const confirmDelete = async () => {
    onConfirmOpenChange();
    try {
      const res = await fetch(`/api/posts/${idForDelete}`, { method: "DELETE" });
      setIdForDelete(null);
      if (!res.ok) {
        throw new Error(t.jobManage.confirmDelete.errorMessage);
      }
      toast.success(t.jobManage.confirmDelete.successMessage);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.jobManage.confirmDelete.errorMessage);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Post ${newStatus.toLowerCase()} successfully`);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error("Failed to update post status");
    }
  };

  // Re-fetch when status filter changes
  useEffect(() => {
    if (hasJobManagementRole) {
      fetchPosts(1);
    }
  }, [statusFilter]);

  const handleCancel = () => {
    setFormData({ title: "", iframe: "", embeddable: true });
    setUrlInput("");
    setEmbedPreview(null);
    setEmbedError(null);
    setDetectedPlatform(null);
    setEditingId(null);
    setIsCreating(false);
  };

  // Handle URL input change and generate embed
  const handleUrlChange = useCallback((value: string) => {
    setUrlInput(value);
    setEmbedError(null);

    if (!value.trim()) {
      setEmbedPreview(null);
      setDetectedPlatform(null);
      setFormData(prev => ({ ...prev, iframe: "" }));
      return;
    }

    // Detect platform for visual feedback
    if (isUrl(value)) {
      setDetectedPlatform(detectPlatform(value));
    } else {
      setDetectedPlatform(null);
    }

    // Generate embed
    const result = generateEmbed(value);

    if (result.success && result.iframe) {
      setEmbedPreview(result.iframe);
      setFormData(prev => ({
        ...prev,
        iframe: result.iframe!,
        embeddable: result.embeddable ?? true
      }));
      setEmbedError(null);
    } else {
      setEmbedPreview(null);
      setFormData(prev => ({ ...prev, iframe: "", embeddable: true }));
      if (value.trim()) {
        setEmbedError(result.error || t.jobManage.form.urlField.invalidUrl);
      }
    }
  }, [t]);

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  // Check if user can edit/delete a post
  const canEditPost = useCallback((post: Post) => {
    // Staff can edit/delete any post
    if (isStaff) return true;
    // Collaborators can only edit their own posts
    if (post.createdBy && session?.user?.id) {
      return post.createdBy.discordId === session.user.id;
    }
    return false;
  }, [isStaff, session?.user?.id]);

  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (!session?.user) {
    return null;
  }

  // Show skeleton while redirecting to prevent flash of content
  if (!hasJobManagementRole || shouldRedirect) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="max-w-6xl w-full space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <h1 className="text-3xl font-bold">{t.jobManage.title}</h1>
            {isStaff && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-default-500">
                  {t.jobManage.autoApprove?.label || "Auto-approve bot posts"}
                </span>
                <Switch
                  isSelected={autoApproveEnabled}
                  isDisabled={isTogglingAutoApprove}
                  onValueChange={handleAutoApproveToggle}
                  size="sm"
                  color="success"
                />
              </div>
            )}
          </CardHeader>
          <CardBody>
            <Tabs
              aria-label={t.jobManage.status.label}
              color="primary"
              variant="underlined"
              selectedKey={statusFilter}
              onSelectionChange={(key) => setStatusFilter(key as string)}
            >
              <Tab key="all" title={t.jobManage.tabs.all} />
              <Tab key="pending" title={t.jobManage.tabs.pending} />
              <Tab key="approved" title={t.jobManage.tabs.approved} />
              <Tab key="rejected" title={t.jobManage.tabs.rejected} />
            </Tabs>
          </CardBody>
        </Card>

        {!isCreating && (
          <div className="flex justify-start">
            <Button
              className={`font-semibold ${focusStates.button}`}
              color="primary"
              variant="shadow"
              onPress={() => setIsCreating(true)}
            >
              {t.jobManage.form.titleNewPost}
            </Button>
          </div>
        )}

        {isCreating && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{editingId ? t.jobManage.form.titleEditPost : t.jobManage.form.titleNewPost}</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t.jobManage.form.titleField.title}
                  placeholder={t.jobManage.form.titleField.placeholder}
                  value={formData.title}
                  onValueChange={(value) => setFormData({ ...formData, title: value })}
                  maxLength={50}
                />

                <div className="space-y-2">
                  <Input
                    label={t.jobManage.form.urlField.title}
                    placeholder={t.jobManage.form.urlField.placeholder}
                    value={urlInput}
                    onValueChange={handleUrlChange}
                    description={t.jobManage.form.urlField.description}
                    isInvalid={!!embedError}
                    errorMessage={embedError}
                    classNames={{
                      input: "font-mono text-sm",
                    }}
                  />

                  {detectedPlatform && detectedPlatform !== 'unknown' && (
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={detectedPlatform === 'linkedin' ? 'primary' : 'secondary'}
                        variant="flat"
                      >
                        {detectedPlatform === 'linkedin' ? 'LinkedIn' : 'Twitter/X'}
                      </Chip>
                      <span className={typography.caption}>{t.jobManage.form.urlField.detected}</span>
                    </div>
                  )}
                </div>

                {embedPreview && (
                  <div className="space-y-2">
                    <span className={`${typography.label} text-default-600`}>{t.jobManage.form.preview}</span>
                    <JobCardPreview
                      html={embedPreview}
                      title={formData.title}
                      sourceUrl={urlInput}
                      embeddable={formData.embeddable}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className={`font-semibold ${focusStates.button}`}
                    type="submit"
                    variant="shadow"
                    color="primary"
                    isDisabled={!formData.iframe}
                  >
                    {editingId ? t.jobManage.form.updateButton : t.jobManage.form.createButton}
                  </Button>
                  <Button
                    type="button"
                    color="default"
                    variant="shadow"
                    onPress={handleCancel}
                  >
                    {t.jobManage.form.cancelButton}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <Table aria-label="Posts table">
              <TableHeader>
                <TableColumn>{t.jobManage.table.head.title}</TableColumn>
                <TableColumn>{t.jobManage.table.head.status}</TableColumn>
                <TableColumn>{t.jobManage.table.head.author}</TableColumn>
                <TableColumn>{t.jobManage.table.head.createdAt}</TableColumn>
                <TableColumn>{t.jobManage.table.head.actions}</TableColumn>
              </TableHeader>
              <TableBody emptyContent={t.jobManage.table.noRows}>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{post.title}</span>
                        {post.sourceUrl && (
                          <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px]">
                            {post.sourceUrl}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          post.status === "APPROVED" ? "success" :
                            post.status === "REJECTED" ? "danger" : "warning"
                        }
                      >
                        {post.status || "PENDING"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {post.createdBy ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            size="sm"
                            src={post.createdBy.avatar
                              ? getDiscordAvatarUrl(post.createdBy.discordId, post.createdBy.avatar, "0")
                              : undefined
                            }
                            name={post.createdBy.username}
                          />
                          <span className="text-sm">{post.createdBy.username}</span>
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Status Actions (Only for PENDING or if staff needs to change it) */}
                        {isStaff && (
                          <>
                            {post.status !== "APPROVED" && (
                              <Button
                                isIconOnly
                                size="sm"
                                color="success"
                                variant="flat"
                                title={t.jobManage.actions.approve}
                                onPress={() => handleStatusUpdate(post.id, "APPROVED")}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </Button>
                            )}
                            {post.status !== "REJECTED" && (
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                title={t.jobManage.actions.reject}
                                onPress={() => handleStatusUpdate(post.id, "REJECTED")}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            )}
                          </>
                        )}

                        {canEditPost(post) && (
                          <>
                            <Button
                              size="sm"
                              className={`font-semibold ${focusStates.button}`}
                              type="button"
                              variant="shadow"
                              color="primary"
                              onPress={() => handleEdit(post)}
                            >
                              {t.jobManage.table.body.edit}
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="shadow"
                              onPress={() => handleDelete(post.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {pagination.pages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              showControls
            />
          </div>
        )}

        <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {t.jobManage.confirmDelete.title}
                </ModalHeader>
                <ModalBody>
                  <p>{t.jobManage.confirmDelete.body}</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    {t.jobManage.confirmDelete.cancel}
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                      confirmDelete();
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
    </div>
  );
}
