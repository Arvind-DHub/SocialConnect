# /api/posts — Post Endpoints

Handles creating, reading, updating, and deleting posts, as well as likes and comments.

## Endpoints

### GET /api/posts

Lists all active posts with pagination.

**Query params:**

- `page` — page number (default: 1)
- `limit` — results per page (default: 10)
- `author_id` — filter posts by a specific user

---

### POST /api/posts

Creates a new post. Auth required.

Accepts either:

- `application/json` — text-only post: `{ "content": "Hello world" }`
- `multipart/form-data` — post with image: fields `content` and `image`

**Image validation:**

- JPEG or PNG only
- Max 2MB
- Uploaded to Supabase Storage at `posts/{userId}/{uuid}.jpg`

---

### GET /api/posts/:id

Gets a single post by ID. Only returns active posts (`is_active = true`).

---

### PATCH /api/posts/:id

Updates a post's content. Auth required. Only the post author can update.

---

### DELETE /api/posts/:id

Soft deletes a post by setting `is_active = false`. Auth required. Only the post author can delete.

> Posts are never hard deleted. Setting `is_active = false` hides them from all queries without destroying the data.

---

### POST /api/posts/:id/like

Likes a post. Auth required.

- Returns 409 if already liked (enforced by database unique constraint)
- `like_count` on the post is updated automatically by a database trigger

---

### DELETE /api/posts/:id/like

Unlikes a post. Auth required.

---

### GET /api/posts/:id/comments

Lists comments on a post, ordered oldest first, with pagination.

---

### POST /api/posts/:id/comments

Adds a comment to a post. Auth required. Max 280 chars.

---

### DELETE /api/posts/:id/comments/:comment_id

Deletes a comment. Auth required. Only the comment author can delete.
