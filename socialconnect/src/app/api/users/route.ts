import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError } from "@/lib/utils";

// Fetch users with optional search and pagination returns total count and has_more flag to reduce load
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url); // using the object wrapper to pull individual parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("users")
      .select(
        "id, username, first_name, last_name, bio, avatar_url, posts_count, followers_count, following_count",
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,first_name.ilike.%${search}%`,
      );
    }

    const { data: users, error, count } = await query;

    if (error) return apiError("Failed to fetch users", 500);

    return apiSuccess({
      data: users || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
