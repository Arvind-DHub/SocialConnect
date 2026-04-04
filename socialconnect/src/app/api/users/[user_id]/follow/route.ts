import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ user_id: string }> };

// Follow a user
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { user_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    //Prevents following yourself
    if (user_id === payload!.userId) {
      return apiError("You can't follow yourself", 400);
    }

    //Check if user exists
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (!targetUser) return apiError("User not found", 404);

    const { error } = await supabaseAdmin
      .from("follows")
      .insert({ follower_id: payload!.userId, following_id: user_id });

    if (error) {
      if (error.code === "23505")
        return apiError("Already following this user", 409);
      return apiError("Failed to follow user", 500);
    }

    return apiSuccess(null, "Now following user", 201);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

// Unfollow a user
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { user_id } = await params;
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    await supabaseAdmin
      .from("follows")
      .delete()
      .eq("follower_id", payload!.userId)
      .eq("following_id", user_id);

    return apiSuccess(null, "Unfollowed user");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
