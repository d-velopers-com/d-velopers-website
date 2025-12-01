"use client";

import {useRouter} from "next/navigation";
import {useSession} from "@/hooks/useSession";
import {useEffect, useState} from "react";
import {SkeletonLoading} from "@/components/skeleton-loading";
import {Card, CardHeader, CardBody} from "@heroui/card";
import {Button} from "@heroui/button";
import {Input} from "@heroui/input";
import {Textarea} from "@heroui/input";
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
import {focusStates} from "@/lib/ui-constants";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@heroui/modal";
import {useLanguage} from "@/contexts/language-context";

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
      .catch(() => setHasJobManagementRole(false))
      .finally(() => setIsLoading(false));
  }, [session, status]);

  const fetchPosts = async (page: number = 1) => {
    try {
      const res = await fetch(`/api/posts?page=${page}&limit=10`);
      const data: PostsResponse = await res.json();
      setPosts(data.posts);
      setPagination(data.pagination);
      setIsLoading(false);
    } catch (err) {
      toast.error(t.jobManage.getting.errorMessage);
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
  }

  const handleCancel = () => {
    setFormData({title: "", iframe: ""});
    setEditingId(null);
    setIsCreating(false);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  if (isLoading) {
    return <SkeletonLoading/>;
  }

  if (!session?.user) {
    return null;
  }

  if (!hasJobManagementRole) {
    router.replace('/');
    return null;
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
              Create New Post
            </Button>
          </div>
        )}

        {isCreating && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{editingId ? "Edit Post" : "Create New Post"}</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Enter post title"
                  value={formData.title}
                  onValueChange={(value) => setFormData({...formData, title: value})}
                  maxLength={50}
                />

                <Textarea
                  label="Iframe"
                  placeholder="Enter iframe HTML content"
                  value={formData.iframe}
                  onValueChange={(value) => setFormData({...formData, iframe: value})}
                  minRows={6}
                  classNames={{
                    input: "font-mono text-sm",
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    className={`font-semibold ${focusStates.button}`}
                    type="submit"
                    variant="shadow"
                    color="primary"
                  >
                    {editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    color="default"
                    variant="shadow"
                    onPress={handleCancel}
                  >
                    Cancel
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
                          type="submit"
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
