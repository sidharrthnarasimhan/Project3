# Required Backend API Endpoints

This document describes the backend API endpoints required for the Startup OS frontend to function properly when using the HTTP client (Clerk authentication).

## Base URL
```
http://localhost:3001/api
```

## Authentication

All endpoints (except `/users/sync`) require a valid Clerk JWT token in the Authorization header:
```
Authorization: Bearer <clerk_jwt_token>
```

---

## User Endpoints

### POST /api/users/sync

**Description**: Creates or updates a user in the backend database based on Clerk authentication data. This endpoint should be idempotent.

**Headers**:
- `Authorization: Bearer <clerk_jwt_token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "clerk_id": "user_xxxxxx",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://clerk.com/avatar.jpg"
}
```

**Success Response** (201 Created or 200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clerk_id": "user_xxxxxx",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://clerk.com/avatar.jpg",
    "created_at": "2026-01-05T12:00:00Z",
    "updated_at": "2026-01-05T12:00:00Z"
  }
}
```

**Error Response** (409 Conflict - User already exists):
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "User already exists"
  }
}
```

**Notes**:
- Should return 409 Conflict if user with same `clerk_id` or `email` already exists
- Frontend handles 409 gracefully and continues with organization creation
- This endpoint is called before organization creation to ensure user exists in database

---

## Organization Endpoints

### POST /api/orgs

**Description**: Creates a new organization. The authenticated user becomes the admin/owner.

**Headers**:
- `Authorization: Bearer <clerk_jwt_token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "logo_url": ""
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "org_uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "logo_url": "",
    "created_at": "2026-01-05T12:00:00Z",
    "owner_id": "user_uuid"
  }
}
```

**Error Responses**:

400 Bad Request (Invalid slug):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SLUG",
    "message": "Organization slug already exists or is invalid"
  }
}
```

404 Not Found (User not found):
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found in database"
  }
}
```

**Notes**:
- The `slug` must be unique across all organizations
- The authenticated user (from JWT) must exist in the database (created via `/users/sync`)
- The user automatically becomes the owner/admin of the organization

---

## Implementation Flow

When a user signs up with Clerk and reaches the organization creation page:

1. **Frontend authenticates with Clerk** → Gets JWT token
2. **Frontend calls POST /api/users/sync** → Creates user in backend database
   - If returns 409, that's OK (user already exists)
   - If returns other error, warn but continue
3. **Frontend calls POST /api/orgs** → Creates organization
   - User should exist in database at this point
   - If returns "User not found", something went wrong in step 2
4. **Frontend stores org ID in localStorage** → `current_org_id`
5. **User can now access the application** → All subsequent API calls include org context

---

## JWT Token Claims

The backend should extract the following from the Clerk JWT token:

- `sub`: Clerk user ID (matches `clerk_id` in database)
- `email`: User's email address
- Any other Clerk-provided claims

The backend should use the `sub` claim to identify which user is making the request.

---

## Error Handling Best Practices

1. Always return JSON responses with consistent structure
2. Use appropriate HTTP status codes
3. Include error codes for programmatic handling
4. Provide clear error messages for debugging
5. Log errors server-side for monitoring

---

## Testing

You can test these endpoints using curl:

```bash
# Get Clerk token from browser console
# window.Clerk.session.getToken()

# Sync user
curl -X POST http://localhost:3001/api/users/sync \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clerk_id":"user_xxx","email":"test@example.com","full_name":"Test User","avatar_url":""}'

# Create organization
curl -X POST http://localhost:3001/api/orgs \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org","slug":"test-org","logo_url":""}'
```
