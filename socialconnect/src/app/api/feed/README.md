# /api/feed — Feed Endpoint

Returns a chronological list of posts for the home feed.

## Endpoint

### GET /api/feed

**Query params:**

- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

**Headers (optional):**
Authorization: Bearer <token>

## Feed Logic

### Not logged in

Returns all public posts in chronological order (newest first).

### Logged in but not following anyone

Returns all public posts in chronological order.

### Logged in and following users

Returns posts from followed users plus own posts, in chronological order. Each post includes an `is_liked` boolean showing whether the current user has liked it.

## Response

```json
{
  "success": true,
  "data": {
    "data": [ ...posts ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}
```

Each post includes the full author object joined from the users table.
