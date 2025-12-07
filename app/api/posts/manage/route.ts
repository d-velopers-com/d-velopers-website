import { NextRequest, NextResponse } from "next/server";
import { getPosts, getPostsCount } from "@/lib/posts";
import { PostStatus } from "@prisma/client";
import { withStaffRole } from "@/middlewares/auth";
import { getUserByDiscordId } from "@/lib/user";
import { accessByRole } from "@/config/access-by-role";

/**
 * Check if user is staff (can see all posts)
 */
function isStaff(roles?: string[]): boolean {
    if (!roles) return false;
    return roles.some(role => accessByRole.staff.includes(role));
}

// GET posts for management - staff sees all, collaborators see only their own
export const GET = withStaffRole(async (request: NextRequest, _context, session) => {
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

        const statusParam = searchParams.get("status");
        const status = statusParam ? (statusParam as PostStatus) : undefined;

        // Check if user is staff
        const userIsStaff = isStaff(session.roles);

        // Get user ID from database
        const user = await getUserByDiscordId(session.discordId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Staff sees all posts, collaborators see only their own
        const createdById = userIsStaff ? undefined : user.id;

        const posts = await getPosts(limit, offset, orConditions, createdById, status);
        const total = await getPostsCount(orConditions, createdById, status);

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
});
