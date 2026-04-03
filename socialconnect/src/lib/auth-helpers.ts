import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, extractToken } from "@/lib/jwt";
import { apiError } from "@/lib/utils";
import type { JWTPayload } from "@/types";

// Used at the start of every protected API route
// Extracts and verifies the JWT, returns the payload or an error response
//
// Usage in any API route:
//   const { payload, errorResponse } = await requireAuth(request)
//   if (errorResponse) return errorResponse
//   // payload.userId is now available
export async function requireAuth(request: NextRequest): Promise<{
  payload: JWTPayload | null;
  errorResponse: NextResponse | null;
}> {
  const token = extractToken(request.headers.get("authorization"));

  if (!token) {
    return {
      payload: null,
      errorResponse: apiError("Authentication required. Please log in.", 401),
    };
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    return {
      payload: null,
      errorResponse: apiError(
        "Your session has expired. Please log in again.",
        401,
      ),
    };
  }

  return { payload, errorResponse: null };
}
