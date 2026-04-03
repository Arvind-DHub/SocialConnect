import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyJWT, extractToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/utils";

// GET /api/auth/me — returns the currently logged-in user
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"));
    if (!token) return apiError("No token provided", 401);

    const payload = await verifyJWT(token);
    if (!payload) return apiError("Invalid or expired token", 401);

    // Fetch fresh data — because bio, avatar etc. may have changed since login
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at, updated_at, last_login",
      )
      .eq("id", payload.userId)
      .single();

    if (error || !user) return apiError("User not found", 404);

    return apiSuccess(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return apiError("An unexpected error occurred", 500);
  }
}
