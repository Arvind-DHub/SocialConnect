# /db — Database Schema

This folder contains everything needed to set up the SocialConnect database.

## Files

| File         | Purpose                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `schema.sql` | Complete SQL to create all tables, indexes, triggers, and RLS policies |

## How to Set Up the Database

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose a name, password, and region
4. Wait for it to finish provisioning (~2 minutes)

### Step 2 — Run the schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `schema.sql`
4. Paste it into the editor
5. Click **Run**

You should see "Success. No rows returned" — that means everything was created correctly.

### Step 3 — Create the Storage bucket

1. Click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly: `socialconnect-media`
4. Toggle **Public bucket** to ON
5. Click **Create bucket**

### Step 4 — Run storage policies

The storage policies are at the bottom of `schema.sql` under STEP 6. Run those separately after creating the bucket.

---

## Tables

### users

Stores all user accounts and profile information.

| Column          | Type         | Description                                   |
| --------------- | ------------ | --------------------------------------------- |
| id              | UUID         | Primary key, auto-generated                   |
| email           | VARCHAR(255) | Unique, required                              |
| username        | VARCHAR(30)  | Unique, 3-30 chars, alphanumeric + underscore |
| password_hash   | TEXT         | bcrypt hash — never the plain password        |
| first_name      | VARCHAR(50)  | Required                                      |
| last_name       | VARCHAR(50)  | Required                                      |
| bio             | VARCHAR(160) | Optional profile bio                          |
| avatar_url      | TEXT         | URL to profile picture in Supabase Storage    |
| website         | TEXT         | Optional website URL                          |
| location        | VARCHAR(100) | Optional location text                        |
| posts_count     | INTEGER      | Denormalized — updated by trigger             |
| followers_count | INTEGER      | Denormalized — updated by trigger             |
| following_count | INTEGER      | Denormalized — updated by trigger             |
| created_at      | TIMESTAMPTZ  | Auto-set on insert                            |
| updated_at      | TIMESTAMPTZ  | Auto-updated by trigger on every update       |
| last_login      | TIMESTAMPTZ  | Updated on every successful login             |

---

### posts

Stores all user posts with optional image attachments.

| Column        | Type        | Description                               |
| ------------- | ----------- | ----------------------------------------- |
| id            | UUID        | Primary key                               |
| content       | TEXT        | Post text, max 280 chars                  |
| author_id     | UUID        | Foreign key → users.id                    |
| image_url     | TEXT        | Optional URL to image in Supabase Storage |
| is_active     | BOOLEAN     | Soft delete flag — false means deleted    |
| like_count    | INTEGER     | Denormalized — updated by trigger         |
| comment_count | INTEGER     | Denormalized — updated by trigger         |
| created_at    | TIMESTAMPTZ | Auto-set on insert                        |
| updated_at    | TIMESTAMPTZ | Auto-updated by trigger                   |

> Posts are never hard deleted. Setting `is_active = false` hides them from all queries.

---

### comments

Stores comments on posts.

| Column     | Type        | Description                 |
| ---------- | ----------- | --------------------------- |
| id         | UUID        | Primary key                 |
| post_id    | UUID        | Foreign key → posts.id      |
| author_id  | UUID        | Foreign key → users.id      |
| content    | TEXT        | Comment text, max 280 chars |
| created_at | TIMESTAMPTZ | Auto-set on insert          |
| updated_at | TIMESTAMPTZ | Auto-updated by trigger     |

---

### likes

Stores which users liked which posts.

| Column     | Type        | Description            |
| ---------- | ----------- | ---------------------- |
| id         | UUID        | Primary key            |
| post_id    | UUID        | Foreign key → posts.id |
| user_id    | UUID        | Foreign key → users.id |
| created_at | TIMESTAMPTZ | Auto-set on insert     |

> A unique constraint on (post_id, user_id) prevents a user from liking the same post twice.

---

### follows

Stores follow relationships between users.

| Column       | Type        | Description                  |
| ------------ | ----------- | ---------------------------- |
| id           | UUID        | Primary key                  |
| follower_id  | UUID        | The user doing the following |
| following_id | UUID        | The user being followed      |
| created_at   | TIMESTAMPTZ | Auto-set on insert           |

> A unique constraint on (follower_id, following_id) prevents duplicate follows. A check constraint prevents self-follows.

---

## Triggers

| Trigger                   | Table    | What it does                                                 |
| ------------------------- | -------- | ------------------------------------------------------------ |
| `set_updated_at_users`    | users    | Sets updated_at = NOW() on every update                      |
| `set_updated_at_posts`    | posts    | Sets updated_at = NOW() on every update                      |
| `set_updated_at_comments` | comments | Sets updated_at = NOW() on every update                      |
| `trigger_posts_count`     | posts    | Updates users.posts_count on insert/delete                   |
| `trigger_like_count`      | likes    | Updates posts.like_count on insert/delete                    |
| `trigger_comment_count`   | comments | Updates posts.comment_count on insert/delete                 |
| `trigger_follow_counts`   | follows  | Updates followers_count and following_count on insert/delete |

---

## Indexes

| Index                    | Table    | Column                            | Purpose                                 |
| ------------------------ | -------- | --------------------------------- | --------------------------------------- |
| `idx_posts_author_id`    | posts    | author_id                         | Fast lookup of posts by user            |
| `idx_posts_created_at`   | posts    | created_at DESC                   | Fast feed queries sorted by newest      |
| `idx_posts_active`       | posts    | created_at DESC (WHERE is_active) | Fast feed queries for active posts only |
| `idx_comments_post_id`   | comments | post_id                           | Fast lookup of comments by post         |
| `idx_comments_author_id` | comments | author_id                         | Fast lookup of comments by user         |
| `idx_likes_post_id`      | likes    | post_id                           | Fast lookup of likes by post            |
| `idx_likes_user_id`      | likes    | user_id                           | Fast lookup of likes by user            |
| `idx_follows_follower`   | follows  | follower_id                       | Fast lookup of who someone follows      |
| `idx_follows_following`  | follows  | following_id                      | Fast lookup of someone's followers      |

---

## Row Level Security

RLS policies are enabled on all tables. They enforce access control at the database level — even if the application code has a bug, the database will reject unauthorized operations.

| Table    | Select               | Insert        | Update         | Delete            |
| -------- | -------------------- | ------------- | -------------- | ----------------- |
| users    | Anyone               | Via API only  | Own row only   | —                 |
| posts    | Anyone (active only) | Authenticated | Own posts only | Own posts only    |
| comments | Anyone               | Authenticated | —              | Own comments only |
| likes    | Anyone               | Authenticated | —              | Own likes only    |
| follows  | Anyone               | Authenticated | —              | Own follows only  |

---

## Entity Relationship

```
users
  ├── posts (one user → many posts)
  ├── comments (one user → many comments)
  ├── likes (one user → many likes)
  ├── follows as follower (one user → many follows)
  └── follows as following (one user → many followers)

posts
  ├── comments (one post → many comments)
  └── likes (one post → many likes)
```
