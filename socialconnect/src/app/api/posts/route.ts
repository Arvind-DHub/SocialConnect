import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth-helpers";
import { createPostSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// POST /api/posts — create a new post
export async function POST(request: NextRequest) {
  try {
    const { payload, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const contentType = request.headers.get("content-type") || "";
    let content = "";
    let image_url: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Post with image — sent as FormData
      const formData = await request.formData();
      content = (formData.get("content") as string) || "";
      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(imageFile.type)) {
          return apiError("Only JPEG and PNG images are allowed", 400);
        }
        if (imageFile.size > 2 * 1024 * 1024) {
          return apiError("Image must be smaller than 2MB", 400);
        }

        const ext = imageFile.type === "image/png" ? "png" : "jpg";
        const fileName = `posts/${payload!.userId}/${uuidv4()}.${ext}`;
        const arrayBuffer = await imageFile.arrayBuffer();

        const { error: uploadError } = await supabaseAdmin.storage
          .from("socialconnect-media")
          .upload(fileName, new Uint8Array(arrayBuffer), {
            contentType: imageFile.type,
          });

        if (uploadError) return apiError("Failed to upload image", 500);

        const { data: urlData } = supabaseAdmin.storage
          .from("socialconnect-media")
          .getPublicUrl(fileName);

        image_url = urlData.publicUrl;
      }
    } else {
      // Text-only post — sent as JSON
      const body = await request.json();
      content = body.content;
      image_url = body.image_url || null;
    }

    const validation = createPostSchema.safeParse({ content, image_url });
    if (!validation.success) {
      return apiError(
        validation.error.issues.map((e) => e.message).join(", "),
        400,
      );
    }

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        content: validation.data.content,
        author_id: payload!.userId,
        image_url: image_url || null,
      })
      .select(
        `
        *,
        author:users(id, username, first_name, last_name, avatar_url)
      `,
      )
      .single();

    if (error) return apiError("Failed to create post", 500);

    return apiSuccess(post, "Post created successfully", 201);
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}

// GET /api/posts — list posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const author_id = searchParams.get("author_id");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
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

    if (author_id) {
      query = query.eq("author_id", author_id);
    }

    const { data: posts, error, count } = await query;

    if (error) return apiError("Failed to fetch posts", 500);

    return apiSuccess({
      data: posts || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error) {
    return apiError("An unexpected error occurred", 500);
  }
}
