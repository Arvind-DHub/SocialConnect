import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyJWT, extractToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/utils";

type Params = { params: { user_id: string } };

// GET /api/users/[user_id] — public, anyone can view a profile
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { user_id } = params;

    // Optionally get current user to check if they follow this profile
    const token = extractToken(request.headers.get("authorization"));
    let currentUserId: string | null = null;
    if (token) {
      const payload = await verifyJWT(token);
      currentUserId = payload?.userId || null;
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        `
        id, email, username, first_name, last_name,
        bio, avatar_url, website, location,
        posts_count, followers_count, following_count,
        created_at, updated_at
      `,
      )
      .eq("id", user_id)
      .single();

    if (error || !user) return apiError("User not found", 404);

    // Check if the current user follows this profile
    let is_following = false;
    if (currentUserId && currentUserId !== user_id) {
      const { data: follow } = await supabaseAdmin
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", user_id)
        .single();

      is_following = !!follow;
    }

    return apiSuccess({ ...user, is_following });
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
