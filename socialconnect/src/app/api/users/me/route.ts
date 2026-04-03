import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { updateProfileSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";

// PATCH /api/users/me — update own profile
export async function PATCH(request: NextRequest) {
  try {
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(
        (e) => `${e.path}: ${e.message}`,
      );
      return apiError(errors.join(", "), 400);
    }

    // Only update fields that were actually sent
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(updateData).length === 0) {
      return apiError("No fields to update", 400);
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", payload!.userId)
      .select(
        "id, email, username, first_name, last_name, bio, avatar_url, website, location, posts_count, followers_count, following_count, created_at, updated_at",
      )
      .single();

    if (error) return apiError("Failed to update profile", 500);

    return apiSuccess(updatedUser, "Profile updated successfully");
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

export { PATCH as PUT };
