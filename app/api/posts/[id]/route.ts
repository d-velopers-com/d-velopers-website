import { PostStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { accessByRole } from "@/config/access-by-role";
import { checkLinkedInEmbedAccessibility } from "@/lib/embed-checker";
import { getPost, updatePost, deletePost } from "@/lib/posts";
import { getUserByDiscordId } from "@/lib/user";
import { isSafeExternalUrl, isValidHtmlString } from "@/lib/validations";
import { getViewerContext } from "@/lib/viewer";
import { withJobManagementRole } from "@/middlewares/auth";

/**
 * Check if user is staff (can edit/delete any post)
 */
function isStaff(roles?: string[]): boolean {
  if (!roles) return false;
  return roles.some((role) => accessByRole.staff.includes(role));
}

/**
 * Check if user is the owner of the post
 */
function isOwner(postCreatorId: string, userId: string): boolean {
  return postCreatorId === userId;
}

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewerContext();
    if (!viewer.session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!viewer.permissions.canViewJobs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = request.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }
    const post = await getPost(id);
    if (!post || post.status !== PostStatus.APPROVED) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 400 },
    );
  }
}

export const PUT = withJobManagementRole(
  async (request: NextRequest, _context, session) => {
    try {
      const id = request.nextUrl.pathname.split("/").pop();
      if (!id) {
        return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
      }

      const existingPost = await getPost(id);
      if (!existingPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Get user from database
      const user = await getUserByDiscordId(session.discordId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check permissions: staff can edit any, collaborators only their own
      const userIsStaff = isStaff(session.roles);
      const userIsOwner =
        existingPost.createdBy && isOwner(existingPost.createdBy.id, user.id);

      if (!userIsStaff && !userIsOwner) {
        return NextResponse.json(
          { error: "You can only edit your own posts" },
          { status: 403 },
        );
      }

      const body = await request.json();
      // Use existing values if not provided (partial update)
      const title = body.title || existingPost.title;
      const iframe = body.iframe || existingPost.iframe;
      const rawSourceUrl =
        body.sourceUrl !== undefined ? body.sourceUrl : existingPost.sourceUrl;
      const sourceUrl =
        typeof rawSourceUrl === "string" && rawSourceUrl.trim()
          ? rawSourceUrl.trim()
          : null;
      const status = body.status;

      if (status && !Object.values(PostStatus).includes(status as PostStatus)) {
        return NextResponse.json(
          { error: "Invalid post status" },
          { status: 422 },
        );
      }

      // Only staff can moderate. Collaborators may edit their own content,
      // which returns it to pending review.
      if (status && !userIsStaff) {
        return NextResponse.json(
          { error: "Only staff can change post status" },
          { status: 403 },
        );
      }

      if (!title || typeof title !== "string") {
        return NextResponse.json(
          { error: "Title is required and must be a string" },
          { status: 422 },
        );
      }

      if (title.length > 200) {
        return NextResponse.json(
          { error: "Title must be 200 characters or less" },
          { status: 422 },
        );
      }

      if (!iframe || typeof iframe !== "string") {
        return NextResponse.json(
          { error: "Iframe is required and must be a string" },
          { status: 422 },
        );
      }

      if (!isValidHtmlString(iframe)) {
        return NextResponse.json(
          { error: "Invalid iframe content" },
          { status: 422 },
        );
      }

      if (
        (body.sourceUrl !== undefined &&
          body.sourceUrl !== null &&
          typeof body.sourceUrl !== "string") ||
        (sourceUrl !== null &&
          (sourceUrl.length > 2048 || !isSafeExternalUrl(sourceUrl)))
      ) {
        return NextResponse.json(
          { error: "Source URL must be a valid HTTP(S) URL" },
          { status: 422 },
        );
      }

      // Determine final status
      let finalStatus = existingPost.status;

      if (status && userIsStaff) {
        // 1. Explicit status change by authorized user (Approve OR Reject)
        finalStatus = status;
      } else if (userIsStaff) {
        // 2. Content edit by authorized user without explicit status -> Auto-Approve
        // (This handles the case where they edit a Pending post to fix it)
        finalStatus = PostStatus.APPROVED;
      } else if (body.title || body.iframe || body.sourceUrl !== undefined) {
        finalStatus = PostStatus.PENDING;
      }
      // 3. Else (non-management user edit), status remains as is (Pending/etc)

      // Check if the embed is accessible (if iframe changed)
      let embeddable = existingPost.embeddable;
      if (body.iframe && body.iframe !== existingPost.iframe) {
        embeddable = await checkLinkedInEmbedAccessibility(iframe);
      }

      const updatedPost = await updatePost(
        id,
        title,
        iframe,
        user.id,
        sourceUrl,
        finalStatus,
        embeddable,
      );

      return NextResponse.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 400 },
      );
    }
  },
);

export const DELETE = withJobManagementRole(
  async (request: NextRequest, _context, session) => {
    try {
      const id = request.nextUrl.pathname.split("/").pop();
      if (!id) {
        return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
      }

      const existingPost = await getPost(id);
      if (!existingPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Get user from database
      const user = await getUserByDiscordId(session.discordId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check permissions: staff can delete any, collaborators only their own
      const userIsStaff = isStaff(session.roles);
      const userIsOwner =
        existingPost.createdBy && isOwner(existingPost.createdBy.id, user.id);

      if (!userIsStaff && !userIsOwner) {
        return NextResponse.json(
          { error: "You can only delete your own posts" },
          { status: 403 },
        );
      }

      await deletePost(id);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 400 },
      );
    }
  },
);
