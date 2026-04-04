# /(auth) — Authentication Pages

Contains the login and register pages. Uses a centered card layout.

## Pages

### /login

Allows users to sign in with their email or username and password.

- Built with React Hook Form for efficient form state management
- Zod validation runs before the API call
- On success: saves JWT token and user data to localStorage, redirects to `/feed`
- Supports `?redirect=/path` query param — redirects to the original destination after login

### /register

Allows new users to create an account.

- Validates all fields with Zod before submitting
- Shows inline error messages for each field
- On success: saves JWT token and user data to localStorage, redirects to `/feed`

## Shared Layout

Both pages share the `(auth)/layout.tsx` which centers the form card on screen with the SocialConnect brand header above it.

## Notes

- These pages are `'use client'` components because they use `useState` and browser events
- The middleware in `src/middleware.ts` automatically redirects logged-in users away from these pages to `/feed`
