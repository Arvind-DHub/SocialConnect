import { apiSuccess } from "@/lib/utils";

// JWT tokens are stateless — nothing to invalidate server-side
// The client simply deletes the token from localStorage
export async function POST() {
  return apiSuccess(null, "Logged out successfully");
}
