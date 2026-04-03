import type { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

// API RESPONSE HELPERS
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return NextResponse.json(response, { status });
}

// Call this when something fails
export function apiError(error: string, status: number = 400): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(response, { status });
}

// Format date as "2 hours ago", "3 days ago" etc.
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: days > 365 ? "numeric" : undefined,
  });
}

// Get full display name from user object
export function getDisplayName(user: {
  first_name: string;
  last_name: string;
}): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

// Get initials for avatar fallback — "John Doe" → "JD"
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
