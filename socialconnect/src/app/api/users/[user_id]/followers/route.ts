import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: Promise<{ user_id: string }> };

// Retrieves all followers of a given user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { user_id } = await params;

    const { data, error } = await supabaseAdmin
      .from("follows")
      .select(
        "follower:users!follower_id(id, username, first_name, last_name, avatar_url)",
      )
      .eq("following_id", user_id);

    if (error) return apiError("Failed to fetch followers", 500);

    const followers = data?.map((f) => f.follower) || [];
    return apiSuccess(followers);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
