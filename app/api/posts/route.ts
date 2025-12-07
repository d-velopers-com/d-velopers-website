import { NextRequest, NextResponse } from "next/server";
import { createPost, getPosts, getPostsCount } from "@/lib/posts";
import { PostStatus } from "@prisma/client";
import { withStaffRole } from "@/middlewares/auth";
import { isValidHtmlString } from "@/lib/validations";
import { getUserByDiscordId } from "@/lib/user";
import { accessByRole } from "@/config/access-by-role";

export const POST = withStaffRole(async (request: NextRequest, _context, session) => {
  const body = await request.json();
  const { title, iframe, sourceUrl } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Title is required and must be a string" },
      { status: 422 }
    );
  }

  if (title.length > 50) {
    return NextResponse.json(
      { error: "Title must be 50 characters or less" },
      { status: 422 }
    );
  }

  if (!iframe || typeof iframe !== "string") {
    return NextResponse.json(
      { error: "Iframe is required and must be a string" },
      { status: 422 }
    );
  }

  if (!isValidHtmlString(iframe)) {
    return NextResponse.json(
      { error: "Invalid iframe content" },
      { status: 422 }
    );
  }

  try {
    // Get user ID from database
    const user = await getUserByDiscordId(session.discordId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check for auto-approval (staff or collaborators)
    const hasJobManagementRole = session.roles?.some(role =>
      accessByRole.jobs_management.includes(role)
    );
    const initialStatus = hasJobManagementRole ? PostStatus.APPROVED : PostStatus.PENDING;

    const post = await createPost(title, iframe, user.id, sourceUrl, initialStatus);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 400 }
    );
  }
});

// GET posts - public endpoint for viewing jobs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const orConditions = search
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map((term) => ({ title: { contains: term, mode: 'insensitive' as const } }));

    const posts = await getPosts(limit, offset, orConditions, undefined, PostStatus.APPROVED);
    const total = await getPostsCount(orConditions, undefined, PostStatus.APPROVED);

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
      { status: 400 }
    );
  }
}
