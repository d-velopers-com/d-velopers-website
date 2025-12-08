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

/**
 * Memoized embed preview to prevent re-renders when other form fields change
 */
const EmbedPreview = memo(function EmbedPreview({ html }: { html: string }) {
  return (
    <div
      className="border border-default-200 rounded-lg p-4 bg-default-50 flex justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      setHasJobManagementRole(false);
      setIsLoading(false);
    });
  }, [session, status]);

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
          <CardHeader className="flex flex-col items-start px-6 py-4">
            <h1 className="text-3xl font-bold">{t.jobManage.title}</h1>
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
                    <EmbedPreview html={embedPreview} />
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
