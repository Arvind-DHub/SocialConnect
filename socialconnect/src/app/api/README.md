# /api — API Route Handlers

All backend logic lives here. Every file named `route.ts` becomes an API endpoint.

## How Route Handlers Work

Next.js uses named exports to handle different HTTP methods:

```typescript
// src/app/api/example/route.ts

export async function GET(request: NextRequest) {
  // handles GET /api/example
}

export async function POST(request: NextRequest) {
  // handles POST /api/example
}
```

## Standard Response Format

Every endpoint returns the same shape:

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "error": "What went wrong"
}
```

## Authentication

Protected routes require an `Authorization` header:
Authorization: Bearer <jwt_token>

The `requireAuth()` helper in `src/lib/auth-helpers.ts` handles this for every protected route.

## Database

All routes use the `supabaseAdmin` client from `src/lib/supabase.ts` which has full database access. This client is never exposed to the browser.
