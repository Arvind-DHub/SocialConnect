import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { updatePostSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ post_id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        author:users(id, username, first_name, last_name, avatar_url)
      `,
      )
      .eq("id", post_id)
      .eq("is_active", true)
      .single();

    if (error || !post) return apiError("Post not found", 404);

    return apiSuccess(post);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { data: existingPost } = await supabaseAdmin
      .from("posts")
      .select("id, author_id")
      .eq("id", post_id)
      .eq("is_active", true)
      .single();

    if (!existingPost) return apiError("Post not found", 404);

    if (existingPost.author_id !== payload!.userId) {
      return apiError("You can only edit your own posts", 403);
    }

    const body = await request.json();
    const validation = updatePostSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((e) => e.message).join(", "),
        400,
      );
    }

    const { data: updatedPost, error } = await supabaseAdmin
      .from("posts")
      .update(validation.data)
      .eq("id", post_id)
      .select(
        `*, author:users(id, username, first_name, last_name, avatar_url)`,
      )
      .single();

    if (error) return apiError("Failed to update post", 500);

    return apiSuccess(updatedPost, "Post updated");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("id, author_id")
      .eq("id", post_id)
      .single();

    if (!post) return apiError("Post not found", 404);

    if (post.author_id !== payload!.userId) {
      return apiError("You can only delete your own posts", 403);
    }

    await supabaseAdmin
      .from("posts")
      .update({ is_active: false })
      .eq("id", post_id);

    return apiSuccess(null, "Post deleted");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

export { PATCH as PUT };
