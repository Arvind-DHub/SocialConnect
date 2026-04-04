import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ user_id: string }> };

// Retrieves all users that the specified user is following
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { user_id } = await params;

    const { data, error } = await supabaseAdmin
      .from("follows")
      .select(
        "following:users!following_id(id, username, first_name, last_name, avatar_url)",
      )
      .eq("follower_id", user_id);

    if (error) return apiError("Failed to fetch following", 500);

    const following = data?.map((f) => f.following) || [];
    return apiSuccess(following);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
