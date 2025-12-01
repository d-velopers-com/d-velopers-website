import {NextRequest, NextResponse} from "next/server";
import {getPost, updatePost, deletePost} from "@/lib/posts";
import {withStaffRole} from "@/middlewares/auth";
import {isValidHtmlString} from "@/lib/validations";

export async function GET(
  request: NextRequest,
  {params}: { params: { id: string } }
) {
  try {
    const {id} = params;
    const post = await getPost(id);
    if (!post) {
      return NextResponse.json({error: "Post not found"}, {status: 404});
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      {error: "Failed to fetch post"},
      {status: 400}
    );
  }
}

export const PUT = withStaffRole(async (
  request: NextRequest,
  {params}: { params: { id: string } },
  _session
) => {
  try {
    const {id} = params;

    const existingPost = await getPost(id);
    if (!existingPost) {
      return NextResponse.json({error: "Post not found"}, {status: 404});
    }

    const body = await request.json();
    const {title, iframe} = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {error: "Title is required and must be a string"},
        {status: 422}
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        {error: "Title must be 200 characters or less"},
        {status: 422}
      );
    }

    if (!iframe || typeof iframe !== "string") {
      return NextResponse.json(
        {error: "Iframe is required and must be a string"},
        {status: 422}
      );
    }

    if (!isValidHtmlString(iframe)) {
      return NextResponse.json(
        {error: "Invalid iframe content"},
        {status: 422}
      );
    }

    const updatedPost = await updatePost(id, title, iframe);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      {error: "Failed to update post"},
      {status: 400}
    );
  }
});

export const DELETE = withStaffRole(async (
  request: NextRequest,
  {params}: { params: { id: string } },
  _session
) => {
  try {
    const {id} = params;

    const existingPost = await getPost(id);
    if (!existingPost) {
      return NextResponse.json({error: "Post not found"}, {status: 404});
    }

    await deletePost(id);

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      {error: "Failed to delete post"},
      {status: 400}
    );
  }
});
