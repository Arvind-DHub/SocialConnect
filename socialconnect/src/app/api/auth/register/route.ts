import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signJWT } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // safeParse never throws — returns { success, data } or { success, error }
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      return apiError(errors.join(", "), 400);
    }

    const { email, username, password, first_name, last_name } =
      validation.data;

    // check if email or username already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, email, username")
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) {
        return apiError("An account with this email already exists", 409);
      }
      return apiError("This username is already taken", 409);
    }

    // hashing the password saltRounds = 12

    const password_hash = await bcrypt.hash(password, 12);

    // create the user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password_hash,
        first_name,
        last_name,
      })
      .select()
      .single();

    if (createError) {
      console.error("Database error creating user:", createError);
      return apiError("Failed to create account. Please try again.", 500);
    }

    // create JWT token
    const token = await signJWT({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    // return token + user (never return password_hash)
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return apiSuccess(
      { user: userWithoutPassword, token },
      "Account created successfully",
      201,
    );
  } catch (error) {
    console.error("Register error:", error);
    return apiError("An unexpected error occurred", 500);
  }
}
