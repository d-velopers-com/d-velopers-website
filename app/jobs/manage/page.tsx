"use client";

import {useRouter} from "next/navigation";
import {useSession} from "@/hooks/useSession";
import {useEffect, useState, useCallback} from "react";
import {SkeletonLoading} from "@/components/skeleton-loading";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Button} from "@heroui/button";
import {Input} from "@heroui/input";
import {toast} from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import {Pagination} from "@heroui/pagination";
import {Chip} from "@heroui/chip";
import {focusStates, stateColors, typography} from "@/lib/ui-constants";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {useLanguage} from "@/contexts/language-context";
import {generateEmbed, isUrl, detectPlatform, type SupportedPlatform} from "@/lib/embed-generator";

interface Post {
  id: string;
  title: string;
  iframe: string;
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

export default function ManageJobPostsPage() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const {t} = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [hasJobManagementRole, setHasJobManagementRole] = useState(false);
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
  const [formData, setFormData] = useState({title: "", iframe: ""});
  const [urlInput, setUrlInput] = useState("");
  const [embedPreview, setEmbedPreview] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<SupportedPlatform | null>(null);
  const [idForDelete, setIdForDelete] = useState<string | null>(null);

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

    fetch("/api/config/staff-roles")
      .then((res) => res.json())
      .then((data) => {
        const staffRoles = data.roles || [];
        const hasRole = session?.user?.roles?.some((role) => staffRoles.includes(role)) || false;
        setHasJobManagementRole(hasRole);
        if (hasRole) {
          fetchPosts();
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => setHasJobManagementRole(false));
  }, [session, status]);

  const fetchPosts = async (page: number = 1) => {
    try {
      const res = await fetch(`/api/posts?page=${page}&limit=10`);
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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t.jobManage.save.errorMessage);
      }

      toast.success(editingId ? t.jobManage.save.updatedSuccessMessage : t.jobManage.save.saveSuccessMessage);
      setFormData({title: "", iframe: ""});
      setEditingId(null);
      setIsCreating(false);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.jobManage.save.errorMessage);
    }
  };

  const handleEdit = (post: Post) => {
    setFormData({title: post.title, iframe: post.iframe});
    setUrlInput(post.iframe); // Show existing iframe in input
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
      const res = await fetch(`/api/posts/${idForDelete}`, {method: "DELETE"});
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

  const handleCancel = () => {
    setFormData({title: "", iframe: ""});
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
      setFormData(prev => ({...prev, iframe: ""}));
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
      setFormData(prev => ({...prev, iframe: result.iframe!}));
      setEmbedError(null);
    } else {
      setEmbedPreview(null);
      setFormData(prev => ({...prev, iframe: ""}));
      if (value.trim()) {
        setEmbedError(result.error || t.jobManage.form.urlField.invalidUrl);
      }
    }
  }, [t]);

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  if (isLoading) {
    return <SkeletonLoading/>;
  }

  if (!session?.user) {
    return null;
  }

  // Show skeleton while redirecting to prevent flash of content
  if (!hasJobManagementRole || shouldRedirect) {
    return <SkeletonLoading/>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="max-w-6xl w-full space-y-6">
        <Card>
          <CardHeader className="flex flex-col items-start px-6 py-4">
            <h1 className="text-3xl font-bold">{t.jobManage.title}</h1>
          </CardHeader>
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
                  onValueChange={(value) => setFormData({...formData, title: value})}
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
                    <div 
                      className="border border-default-200 rounded-lg p-4 bg-default-50 flex justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{__html: embedPreview}}
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
                <TableColumn>{t.jobManage.table.head.createdAt}</TableColumn>
                <TableColumn>{t.jobManage.table.head.actions}</TableColumn>
              </TableHeader>
              <TableBody emptyContent={t.jobManage.table.noRows}>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
                          size="sm"
                          color="danger"
                          variant="shadow"
                          onPress={() => handleDelete(post.id)}
                        >
                          {t.jobManage.table.body.delete}
                        </Button>
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
