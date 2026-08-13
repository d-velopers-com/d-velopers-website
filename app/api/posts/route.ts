import { PostStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { accessByRole } from "@/config/access-by-role";
import { checkIframeEmbedAccessibility } from "@/lib/embed-checker";
import {
  buildPostSearchConditions,
  createPost,
  getPosts,
  getPostsCount,
} from "@/lib/posts";
import { shouldAutoApproveBotPosts } from "@/lib/system-config";
import { getUserByDiscordId } from "@/lib/user";
import { isSafeExternalUrl, isValidHtmlString } from "@/lib/validations";
import { getViewerContext } from "@/lib/viewer";
import { withJobManagementRole } from "@/middlewares/auth";

export const POST = withJobManagementRole(
  async (request: NextRequest, _context, session) => {
    const body = await request.json();
    const { title, iframe, sourceUrl } = body;
    const normalizedSourceUrl =
      typeof sourceUrl === "string" && sourceUrl.trim()
        ? sourceUrl.trim()
        : null;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 422 },
      );
    }

    if (title.length > 50) {
      return NextResponse.json(
        { error: "Title must be 50 characters or less" },
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
      (sourceUrl !== undefined &&
        sourceUrl !== null &&
        typeof sourceUrl !== "string") ||
      (normalizedSourceUrl !== null &&
        (normalizedSourceUrl.length > 2048 ||
          !isSafeExternalUrl(normalizedSourceUrl)))
    ) {
      return NextResponse.json(
        { error: "Source URL must be a valid HTTP(S) URL" },
        { status: 422 },
      );
    }

    try {
      // Get user ID from database
      const user = await getUserByDiscordId(session.discordId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check for auto-approval (staff or collaborators)
      const userIsStaff = session.roles?.some((role) =>
        accessByRole.staff.includes(role),
      );
      const autoApproveEnabled = userIsStaff
        ? await shouldAutoApproveBotPosts()
        : false;
      const initialStatus =
        userIsStaff && autoApproveEnabled
          ? PostStatus.APPROVED
          : PostStatus.PENDING;

      // Server-side embed accessibility check
      // Use the value from frontend as a hint, but verify server-side
      let embeddable = body.embeddable ?? true;

      // Only perform server-side check if frontend says it's embeddable
      // This avoids unnecessary checks for content already marked as non-embeddable
      if (embeddable) {
        embeddable = await checkIframeEmbedAccessibility(iframe);
      }

      const post = await createPost(
        title,
        iframe,
        user.id,
        normalizedSourceUrl,
        initialStatus,
        embeddable,
      );
      return NextResponse.json(post, { status: 201 });
    } catch (error) {
      console.error("Error creating post:", error);
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 400 },
      );
    }
  },
);

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewerContext();
    if (!viewer.session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!viewer.permissions.canViewJobs) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 10;
    const page = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const orConditions = buildPostSearchConditions(search);

    const posts = await getPosts(
      limit,
      offset,
      orConditions,
      undefined,
      PostStatus.APPROVED,
    );
    const total = await getPostsCount(
      orConditions,
      undefined,
      PostStatus.APPROVED,
    );

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 400 },
    );
  }
}
