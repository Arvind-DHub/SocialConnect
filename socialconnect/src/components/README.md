# /components — Reusable UI Components

All shared UI components used across multiple pages.

## Structure

components/
├── posts/
│ ├── PostCard.tsx → Displays a single post with like, comment, delete actions
│ └── CreatePostForm.tsx → Form for writing and submitting new posts
├── auth/ → (future auth-related components)
├── profile/ → (future profile-related components)
└── ui/ → (future generic UI components)

## PostCard

Displays a single post. Handles:

- Showing author avatar, name, username, timestamp
- Displaying post content and optional image
- Like button with optimistic update (UI updates instantly, confirmed by server)
- Comment toggle — loads comments on demand
- Inline comment form for logged-in users
- Delete option (three-dot menu) for post owner only

**Props:**

```typescript
interface PostCardProps {
  post: PostWithAuthor; // The post data including author
  onDelete?: (id: string) => void; // Called when post is deleted
}
```

## CreatePostForm

A form at the top of the feed for creating new posts. Handles:

- Text input with 280 character countdown
- Optional image attachment (JPEG/PNG, max 2MB)
- Image preview before submitting
- Sends as `FormData` when image is attached, `JSON` for text-only
- Calls `onPostCreated` with the new post so the parent can add it to the list instantly

**Props:**

```typescript
interface Props {
  onPostCreated: (post: PostWithAuthor) => void;
}
```

## Styling

All components use Tailwind CSS utility classes and DaisyUI component classes (`btn`, `card`, `input`, `avatar`, `dropdown`, etc.).
