import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ post_id: string; comment_id: string }> };

// Delete a comment
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { post_id, comment_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { data: comment } = await supabaseAdmin
      .from("comments")
      .select("id, author_id")
      .eq("id", comment_id)
      .eq("post_id", post_id)
      .single();

    if (!comment) return apiError("Comment not found", 404);

    if (comment.author_id !== payload!.userId) {
      return apiError("You can only delete your own comments", 403);
    }

    await supabaseAdmin.from("comments").delete().eq("id", comment_id);

    return apiSuccess(null, "Comment deleted");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
