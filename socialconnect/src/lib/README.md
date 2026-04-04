# /lib — Utilities and Configuration

Helper functions and configuration used across the entire app.

## Files

### supabase.ts

Creates and exports two Supabase clients:

- `supabase` — anon key client, safe for browser use, respects Row Level Security
- `supabaseAdmin` — service role client, server-only, bypasses RLS, full database access

> Never import `supabaseAdmin` in a component or page. Only use it inside `app/api/` routes.

---

### jwt.ts

JWT token utilities using the `jose` library:

- `signJWT(payload)` — creates a signed JWT token, expires in 7 days
- `verifyJWT(token)` — verifies a token, returns payload or null if invalid/expired
- `extractToken(authHeader)` — strips `Bearer ` prefix from the Authorization header

---

### auth-helpers.ts

- `requireAuth(request)` — extracts and verifies the JWT from a request. Returns `{ payload, errorResponse }`. If `errorResponse` is not null, return it immediately. Used at the start of every protected API route.

---

### validations.ts

Zod schemas for validating all incoming request data:

| Schema                | Used in                      |
| --------------------- | ---------------------------- |
| `registerSchema`      | POST /api/auth/register      |
| `loginSchema`         | POST /api/auth/login         |
| `createPostSchema`    | POST /api/posts              |
| `updatePostSchema`    | PATCH /api/posts/:id         |
| `updateProfileSchema` | PATCH /api/users/me          |
| `createCommentSchema` | POST /api/posts/:id/comments |

Also exports TypeScript types inferred from each schema (e.g. `RegisterInput`, `LoginInput`).

---

### utils.ts

General utility functions:

- `apiSuccess(data, message?, status?)` — returns a standardised success `NextResponse`
- `apiError(error, status?)` — returns a standardised error `NextResponse`
- `timeAgo(dateString)` — formats a date as "2h ago", "3d ago" etc.
- `getDisplayName(user)` — returns "First Last" from a user object
- `getInitials(name)` — returns "FL" initials for avatar fallbacks
