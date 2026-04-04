import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyJWT, extractToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/utils";

// GET /api/feed
// Logged in + following people → personalised feed
// Everyone else → all public posts chronologically
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const token = extractToken(request.headers.get("authorization"));
    const payload = token ? await verifyJWT(token) : null;
    const currentUserId = payload?.userId;

    let posts = null;
    let count = null;

    if (currentUserId) {
      // Get list of people this user follows
      const { data: follows } = await supabaseAdmin
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId);

      const followingIds = follows?.map((f) => f.following_id) || [];

      if (followingIds.length > 0) {
        // Personalised: posts from followed users + own posts
        const ids = [...followingIds, currentUserId];
        const result = await supabaseAdmin
          .from("posts")
          .select(
            `
            *,
            author:users(id, username, first_name, last_name, avatar_url)
          `,
            { count: "exact" },
          )
          .eq("is_active", true)
          .in("author_id", ids)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        posts = result.data;
        count = result.count;

        // Add is_liked flag for each post
        if (posts && posts.length > 0) {
          const postIds = posts.map((p) => p.id);
          const { data: likes } = await supabaseAdmin
            .from("likes")
            .select("post_id")
            .eq("user_id", currentUserId)
            .in("post_id", postIds);

          const likedPostIds = new Set(likes?.map((l) => l.post_id));
          posts = posts.map((p) => ({
            ...p,
            is_liked: likedPostIds.has(p.id),
          }));
        }
      }
    }

    // Fall back to public feed if not logged in or no follows
    if (!posts) {
      const result = await supabaseAdmin
        .from("posts")
        .select(
          `
          *,
          author:users(id, username, first_name, last_name, avatar_url)
        `,
          { count: "exact" },
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      posts = result.data;
      count = result.count;
    }

    return apiSuccess({
      data: posts || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error("Feed error:", error);
    return apiError("An unexpected error occurred", 500);
  }
}
