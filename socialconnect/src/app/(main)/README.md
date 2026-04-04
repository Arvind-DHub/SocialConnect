# /(main) — Main Application Pages

Contains the core app pages that logged-in users interact with. Uses the navbar layout.

## Pages

### /feed

The home feed page. Shows posts from followed users (if any) or all public posts.

- Loads posts from `/api/feed` on mount
- Shows `CreatePostForm` at the top for writing new posts
- Optimistic updates — new posts appear instantly without a full reload
- Load more button for pagination
- Posts can be deleted inline (owner only)

### /profile/:user_id

Shows a user's public profile and their posts.

- Loads profile from `/api/users/:id` and posts from `/api/posts?author_id=:id` in parallel using `Promise.all`
- Shows follower/following/post counts
- Follow/unfollow button with optimistic updates
- Shows "Edit Profile" button when viewing own profile

## Shared Layout

Both pages share `(main)/layout.tsx` which includes:

- Sticky top navbar with SocialConnect branding
- Navigation links (Feed, Profile)
- New Post button
- User avatar dropdown with logout option

## Notes

- All pages in this group are `'use client'` because they use hooks and browser state
- The middleware in `src/middleware.ts` protects these routes — unauthenticated users are redirected to `/login`
