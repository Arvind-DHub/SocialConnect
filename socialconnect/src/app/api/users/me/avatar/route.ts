import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { apiSuccess, apiError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// POST /api/users/me/avatar
export async function POST(request: NextRequest) {
  try {
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) return apiError("No file provided", 400);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return apiError("Only JPEG and PNG images are allowed", 400);
    }

    // Validate file size — max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return apiError("Image must be smaller than 2MB", 400);
    }

    // Upload to Supabase Storage
    const ext = file.type === "image/png" ? "png" : "jpg";
    const fileName = `avatars/${payload!.userId}/${uuidv4()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("socialconnect-media")
      .upload(fileName, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) return apiError("Failed to upload image", 500);

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("socialconnect-media")
      .getPublicUrl(fileName);

    // Update the user record
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", payload!.userId)
      .select("id, username, avatar_url")
      .single();

    if (updateError) return apiError("Failed to update profile", 500);

    return apiSuccess(
      { avatar_url: urlData.publicUrl, user: updatedUser },
      "Avatar updated successfully",
    );
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
