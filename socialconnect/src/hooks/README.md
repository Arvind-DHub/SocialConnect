# /hooks — Custom React Hooks

Custom hooks that encapsulate reusable stateful logic.

## useAuth

Located at `hooks/useAuth.ts`

Provides the current authentication state to any client component.

**Returns:**

| Property          | Type                  | Description                               |
| ----------------- | --------------------- | ----------------------------------------- |
| `user`            | `UserProfile \| null` | The logged-in user, or null               |
| `token`           | `string \| null`      | The JWT token, or null                    |
| `isLoading`       | `boolean`             | True while reading from localStorage      |
| `isAuthenticated` | `boolean`             | True if user is logged in                 |
| `authHeaders`     | `object`              | Ready-to-use headers for fetch calls      |
| `logout`          | `function`            | Clears auth state and redirects to /login |

**Usage:**

```typescript
const { user, authHeaders, logout } = useAuth();

// Use authHeaders in fetch calls
const response = await fetch("/api/posts", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify(data),
});
```

**How it works:**

- On first render, reads `auth-token` and `user` from `localStorage`
- Sets `isLoading = true` until localStorage has been read
- `logout()` removes both keys from localStorage and redirects to `/login`

## Notes

- All hooks must be used inside `'use client'` components only
- `useAuth` reads from `localStorage` which is only available in the browser — never on the server
