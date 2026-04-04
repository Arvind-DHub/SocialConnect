# /app — Next.js App Router

This directory contains all pages and API routes using the Next.js 14 App Router.

## Structure

app/
├── page.tsx → Home page (/)
├── layout.tsx → Root layout — wraps every page, adds fonts and toast provider
├── globals.css → Global styles — Tailwind directives and base styles
├── api/ → All backend API route handlers
├── (auth)/ → Login and register pages (route group, no effect on URL)
└── (main)/ → Main app pages — feed, profile (requires login)

## Route Groups

Route groups use `()` in their folder name. They let us share layouts between pages without affecting the URL structure.

- `(auth)/` — pages that use the centered auth card layout (login, register)
- `(main)/` — pages that use the navbar layout (feed, profile)

## How Pages Work

In the App Router, every `page.tsx` file becomes a route:

| File                                    | URL                 |
| --------------------------------------- | ------------------- |
| `app/page.tsx`                          | `/`                 |
| `app/(auth)/login/page.tsx`             | `/login`            |
| `app/(auth)/register/page.tsx`          | `/register`         |
| `app/(main)/feed/page.tsx`              | `/feed`             |
| `app/(main)/profile/[user_id]/page.tsx` | `/profile/:user_id` |

## Server vs Client Components

- By default all components are **Server Components** — they run on the server and have no access to browser APIs
- Adding `'use client'` at the top makes it a **Client Component** — it runs in the browser and can use `useState`, `useEffect`, event handlers etc.
- API routes (`app/api/`) always run on the server
