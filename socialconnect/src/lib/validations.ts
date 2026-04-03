import { z } from "zod";

// AUTH VALIDATIONS
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),

  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
});

export const loginSchema = z.object({
  // Accepts email OR username
  identifier: z.string().min(1, "Email or username is required"),

  password: z.string().min(1, "Password is required"),
});

// POST VALIDATIONS
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post cannot be empty")
    .max(280, "Post cannot exceed 280 characters"),

  image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

// .partial() makes all fields optional — for PATCH requests
export const updatePostSchema = createPostSchema.partial();

// PROFILE VALIDATIONS
export const updateProfileSchema = z.object({
  bio: z
    .string()
    .max(160, "Bio cannot exceed 160 characters")
    .optional()
    .nullable(),

  avatar_url: z.string().url("Must be a valid URL").optional().nullable(),

  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),

  location: z.string().max(100, "Location is too long").optional().nullable(),

  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
});

// COMMENT VALIDATIONS
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(280, "Comment cannot exceed 280 characters"),
});

// Generate TypeScript types from Zod schemas for safe, consistent data
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
