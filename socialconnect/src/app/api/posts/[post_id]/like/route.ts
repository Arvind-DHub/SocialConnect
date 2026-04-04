import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ post_id: string }> };

// Like a post
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { error } = await supabaseAdmin
      .from("likes")
      .insert({ post_id, user_id: payload!.userId });

    if (error) {
      if (error.code === "23505")
        return apiError("You have already liked this post", 409);
      return apiError("Failed to like post", 500);
    }

    return apiSuccess(null, "Post liked", 201);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

// Unlike a post
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { post_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    await supabaseAdmin
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", payload!.userId);

    return apiSuccess(null, "Post unliked");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
