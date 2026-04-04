# /types — TypeScript Type Definitions

All shared TypeScript interfaces used across the entire application.

## File: index.ts

### User

Represents a full row from the `users` database table.
Includes all fields except `password_hash` which is never sent to clients.

### UserProfile

Extends `User` (omitting `password_hash`) with an optional `is_following` field.
This is what API routes return when sharing user data with clients.

### Post

Represents a row from the `posts` table.
Includes `like_count` and `comment_count` which are denormalized fields kept in sync by database triggers.

### PostWithAuthor

A post with the full author object joined in. Includes `is_liked` to show whether the current user liked it.
Used in feed and post list responses.

### Comment

A row from the `comments` table, optionally joined with the author's profile.

### Like

A row from the `likes` table representing one user liking one post.

### Follow

A row from the `follows` table. `follower_id` is the person doing the following, `following_id` is the person being followed.

### ApiResponse\<T\>

The standard shape every API route returns:

```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### PaginatedResponse\<T\>

Returned by list endpoints (feed, posts, users, comments):

```typescript
{
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}
```

### JWTPayload

The data stored inside a JWT token: `userId`, `email`, `username`.

### AuthResponse

Returned by login and register: `{ user: UserProfile, token: string }`.
