import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/types";

// Convert the secret string to bytes — jose requires Uint8Array format
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// CREATE a JWT token
export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

// VERIFY a JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    // jwtVerify throws if token is expired, tampered, or signed with wrong secret We return null — caller then returns a 401
    return null;
  }
}

// EXTRACT token from Authorization header
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
