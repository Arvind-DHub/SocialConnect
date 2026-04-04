export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

// we do not include password_hash
export interface UserProfile extends Omit<User, "password_hash"> {
  is_following?: boolean;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  image_url: string | null;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string; // ← this was missing
  updated_at: string;
  author?: UserProfile;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  author_id: string;
  image_url: string | null;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  author: UserProfile; // ← required, not optional
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// API RESPONSE
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// JWT token
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// login/register endpoints return
export interface AuthResponse {
  user: UserProfile;
  token: string;
}
