# /api/auth — Authentication Endpoints

Handles user registration, login, logout, and fetching the current user.

## Endpoints

### POST /api/auth/register

Creates a new user account.

**Request body:**

```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "Password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "username": "..." },
    "token": "eyJhbGci..."
  },
  "message": "Account created successfully"
}
```

**Validation rules:**

- `email` — must be valid email format
- `username` — 3-30 chars, letters/numbers/underscores only
- `password` — min 8 chars, at least 1 uppercase, at least 1 number
- `first_name` / `last_name` — required, max 50 chars

---

### POST /api/auth/login

Logs in with email OR username plus password.

**Request body:**

```json
{
  "identifier": "john@example.com",
  "password": "Password123"
}
```

**Notes:**

- `identifier` accepts either email or username
- Uses timing-safe password comparison to prevent timing attacks
- Updates `last_login` timestamp on success

---

### POST /api/auth/logout

Clears the session. JWT tokens are stateless so this is handled client-side by deleting the token from localStorage.

---

### GET /api/auth/me

Returns the currently logged-in user's fresh profile data.

**Headers required:**
Authorization: Bearer <token>

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds) before storing
- JWT tokens expire after 7 days
- Login always runs bcrypt.compare() even for non-existent users to prevent timing attacks
- Generic error messages on login failure — never reveals which field was wrong
