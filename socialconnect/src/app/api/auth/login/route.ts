import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signJWT } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Invalid input", 400);
    }

    const { identifier, password } = validation.data;
    const isEmail = identifier.includes("@");

    // Find user by email or username
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq(isEmail ? "email" : "username", identifier.toLowerCase())
      .single();

    // Run bcrypt.compare() even if user doesn't exist This ensures the response time is the same whether the email exists or not
    const DUMMY_HASH = "$2b$12$dummyhashfortimingprevention1234567890abcde";
    const passwordToCheck = user?.password_hash || DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, passwordToCheck);

    if (!user || !isPasswordValid) {
      return apiError("Invalid credentials", 401);
    }

    // Update last_login timestamp
    await supabaseAdmin
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { password_hash, ...userWithoutPassword } = user;

    return apiSuccess({ user: userWithoutPassword, token }, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return apiError("An unexpected error occurred", 500);
  }
}
