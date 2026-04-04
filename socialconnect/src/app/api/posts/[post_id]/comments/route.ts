import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { createCommentSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ post_id: string }> };

// Fetch comments from a post
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const {
      data: comments,
      error,
      count,
    } = await supabaseAdmin
      .from("comments")
      .select(
        `
        *,
        author:users(id, username, first_name, last_name, avatar_url)
      `,
        { count: "exact" },
      )
      .eq("post_id", post_id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) return apiError("Failed to fetch comments", 500);

    return apiSuccess({
      data: comments || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

// Add a comment to the post
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return apiError(validation.error.issues[0].message, 400);
    }

    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .eq("is_active", true)
      .single();

    if (!post) return apiError("Post not found", 404);

    const { data: comment, error } = await supabaseAdmin
      .from("comments")
      .insert({
        post_id,
        author_id: payload!.userId,
        content: validation.data.content,
      })
      .select(
        `*, author:users(id, username, first_name, last_name, avatar_url)`,
      )
      .single();

    if (error) return apiError("Failed to add comment", 500);

    return apiSuccess(comment, "Comment added", 201);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
