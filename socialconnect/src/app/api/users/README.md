# /api/users — User Profile Endpoints

Handles reading and updating user profiles, avatar uploads, and the follow system.

## Endpoints

### GET /api/users

Lists all users with optional search and pagination.

**Query params:**

- `page` — page number (default: 1)
- `limit` — results per page (default: 20)
- `search` — filter by username or first name

---

### GET /api/users/:id

Gets a single user's public profile.

If an auth token is provided, the response includes `is_following` — whether the current user follows this profile.

---

### PATCH /api/users/me

Updates the logged-in user's own profile. Auth required.

**Updatable fields:**

- `bio` — max 160 chars
- `avatar_url` — URL string
- `website` — valid URL
- `location` — max 100 chars
- `first_name` / `last_name`

Only sends fields that were actually included in the request — other fields are untouched.

---

### POST /api/users/me/avatar

Uploads a profile picture to Supabase Storage and updates the user's `avatar_url`. Auth required.

**Request:** `multipart/form-data` with field name `avatar`

**Validation:**

- File type: JPEG or PNG only
- Max size: 2MB
- Stored at: `avatars/{userId}/{uuid}.jpg`

---

### POST /api/users/:id/follow

Follows a user. Auth required.

- Cannot follow yourself
- Cannot follow someone you already follow (returns 409)

---

### DELETE /api/users/:id/follow

Unfollows a user. Auth required.

---

### GET /api/users/:id/followers

Returns a list of users who follow this user.

---

### GET /api/users/:id/following

Returns a list of users this user follows.

## Notes on Follow Counts

`followers_count` and `following_count` on the user record are updated automatically by a PostgreSQL trigger when a follow row is inserted or deleted. No manual count update needed in the API code.
