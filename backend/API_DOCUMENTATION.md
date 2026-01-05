# Startup OS Backend API Documentation

## Base URL

```
http://localhost:3001/api
```

Production: Replace with your deployed backend URL

## Authentication

All API endpoints (except health check) require authentication via Clerk.

**Headers:**
```
Authorization: Bearer <clerk_jwt_token>
```

**Getting the token:**
- Use Clerk's client SDK to get the session token
- Include it in all requests

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Valid token but insufficient permissions

## Common Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Role-Based Access Control

**Roles:**
- `admin` - Full access to all features
- `manager` - Can manage most resources, limited billing access
- `member` - Can create and manage own resources
- `guest` - Read-only access

**Permission Rules:**
- Admins always have full access
- Each endpoint specifies minimum role required
- Resource owners can manage their own resources
- Page permissions control UI access (stored separately)

---

## Health Check

### GET /health

Check if the server is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-05T12:00:00.000Z"
}
```

---

## Organizations

Organizations are the top-level multi-tenant container for all data.

### GET /orgs

List all organizations the authenticated user belongs to.

**Authentication:** Required
**Permissions:** Any authenticated user

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "logo_url": "https://example.com/logo.png",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /orgs

Create a new organization. The creator becomes the admin.

**Authentication:** Required
**Permissions:** Any authenticated user

**Request Body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "logo_url": "https://example.com/logo.png"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "logo_url": "https://example.com/logo.png",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- Automatically creates default page permissions for all pages
- Adds creator as admin member

### GET /orgs/:orgId

Get a specific organization.

**Authentication:** Required
**Permissions:** Organization member

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "logo_url": "https://example.com/logo.png",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /orgs/:orgId

Update an organization.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "name": "New Name",
  "logo_url": "https://example.com/new-logo.png"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "New Name",
    "slug": "acme-corp",
    "logo_url": "https://example.com/new-logo.png",
    "updated_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### DELETE /orgs/:orgId

Delete an organization and all its data.

**Authentication:** Required
**Permissions:** Admin only

**Response:**
```json
{
  "message": "Organization deleted successfully"
}
```

**Warning:** This permanently deletes all organization data via CASCADE.

### GET /orgs/:orgId/members

List all members of an organization.

**Authentication:** Required
**Permissions:** Organization member

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john@acme.com",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "role": "admin",
      "joined_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/members

Add a new member to the organization.

**Authentication:** Required
**Permissions:** Admin or Manager

**Request Body:**
```json
{
  "email": "jane@acme.com",
  "role": "member"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "jane@acme.com",
    "full_name": "Jane Smith",
    "role": "member",
    "joined_at": "2024-01-05T12:00:00.000Z"
  }
}
```

**Notes:**
- User must exist in Clerk
- Email is used to look up user

### PUT /orgs/:orgId/members/:memberId

Update a member's role.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "role": "manager"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "jane@acme.com",
    "role": "manager",
    "updated_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### DELETE /orgs/:orgId/members/:memberId

Remove a member from the organization.

**Authentication:** Required
**Permissions:** Admin only

**Response:**
```json
{
  "message": "Member removed successfully"
}
```

### GET /orgs/:orgId/page-permissions

Get page access permissions for the organization.

**Authentication:** Required
**Permissions:** Organization member

**Response:**
```json
{
  "data": {
    "Home": ["admin", "manager", "member", "guest"],
    "Tasks": ["admin", "manager", "member"],
    "Settings": ["admin"]
  }
}
```

### PUT /orgs/:orgId/page-permissions/:pageName

Update allowed roles for a specific page.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "allowed_roles": ["admin", "manager", "member"]
}
```

**Response:**
```json
{
  "data": {
    "page_name": "Tasks",
    "allowed_roles": ["admin", "manager", "member"],
    "updated_at": "2024-01-05T12:00:00.000Z"
  }
}
```

---

## Decisions

Decision-making and voting system.

### GET /orgs/:orgId/decisions

List all decisions in the organization.

**Authentication:** Required
**Permissions:** Organization member

**Query Parameters:**
- `status` - Filter by status: `discussion`, `voting`, `decided`, `archived`
- `category` - Filter by category: `product`, `hiring`, `process`, `strategy`, `other`
- `sortBy` - Sort field (prefix with `-` for descending): `created_at`, `-created_at`, `deadline`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Should we adopt TypeScript?",
      "description": "Evaluate benefits and costs of TypeScript migration",
      "status": "voting",
      "category": "product",
      "deadline": "2024-01-15T00:00:00.000Z",
      "created_by": "john@acme.com",
      "owner_email": "john@acme.com",
      "votes_for": 5,
      "votes_against": 2,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/decisions

Create a new decision.

**Authentication:** Required
**Permissions:** Organization member (can only create in `discussion` status)

**Request Body:**
```json
{
  "title": "Should we adopt TypeScript?",
  "description": "Evaluate benefits and costs",
  "category": "product",
  "deadline": "2024-01-15T00:00:00.000Z",
  "status": "discussion"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Should we adopt TypeScript?",
    "status": "discussion",
    "owner_email": "john@acme.com",
    "created_at": "2024-01-05T12:00:00.000Z"
  }
}
```

**Permission Rules:**
- Members can only create decisions in `discussion` status
- Managers and admins can create in any status

### GET /orgs/:orgId/decisions/:id

Get a specific decision.

**Authentication:** Required
**Permissions:** Organization member

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Should we adopt TypeScript?",
    "description": "Evaluate benefits and costs of TypeScript migration",
    "status": "voting",
    "category": "product",
    "deadline": "2024-01-15T00:00:00.000Z",
    "created_by": "john@acme.com",
    "owner_email": "john@acme.com",
    "votes_for": 5,
    "votes_against": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### PUT /orgs/:orgId/decisions/:id

Update a decision.

**Authentication:** Required
**Permissions:** Owner, Manager, or Admin

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "voting",
  "category": "strategy",
  "deadline": "2024-01-20T00:00:00.000Z"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Updated title",
    "status": "voting",
    "updated_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### DELETE /orgs/:orgId/decisions/:id

Delete a decision.

**Authentication:** Required
**Permissions:** Owner, Manager, or Admin

**Response:**
```json
{
  "message": "Decision deleted successfully"
}
```

### POST /orgs/:orgId/decisions/:id/vote

Vote on a decision.

**Authentication:** Required
**Permissions:** Organization member

**Request Body:**
```json
{
  "vote": "for"
}
```

**Valid votes:** `for`, `against`

**Response:**
```json
{
  "data": {
    "decision_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_email": "john@acme.com",
    "vote": "for",
    "created_at": "2024-01-05T12:00:00.000Z"
  }
}
```

**Notes:**
- Users can change their vote by voting again
- Only one vote per user per decision

---

## Tasks

Task management with priorities and assignments.

### GET /orgs/:orgId/tasks

List all tasks in the organization.

**Authentication:** Required
**Permissions:** Organization member

**Query Parameters:**
- `status` - Filter: `todo`, `in_progress`, `done`, `archived`
- `priority` - Filter: `low`, `medium`, `high`, `urgent`
- `assigned_to` - Filter by assignee email
- `sortBy` - Sort field: `created_at`, `-created_at`, `due_date`, `priority`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Implement login page",
      "description": "Create login UI with Clerk integration",
      "status": "in_progress",
      "priority": "high",
      "assigned_to": "jane@acme.com",
      "due_date": "2024-01-10T00:00:00.000Z",
      "created_by": "john@acme.com",
      "owner_email": "john@acme.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/tasks

Create a new task.

**Authentication:** Required
**Permissions:** Organization member

**Request Body:**
```json
{
  "title": "Implement login page",
  "description": "Create login UI with Clerk integration",
  "priority": "high",
  "assigned_to": "jane@acme.com",
  "due_date": "2024-01-10T00:00:00.000Z"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Implement login page",
    "status": "todo",
    "owner_email": "john@acme.com",
    "created_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### GET /orgs/:orgId/tasks/:id

Get a specific task.

**Authentication:** Required
**Permissions:** Organization member

### PUT /orgs/:orgId/tasks/:id

Update a task.

**Authentication:** Required
**Permissions:** Owner, Assigned user, Manager, or Admin

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "done",
  "priority": "medium"
}
```

### DELETE /orgs/:orgId/tasks/:id

Delete a task.

**Authentication:** Required
**Permissions:** Owner, Manager, or Admin

---

## Spaces

Confluence-like documentation spaces with access control.

### GET /orgs/:orgId/spaces

List accessible spaces.

**Authentication:** Required
**Permissions:** Organization member

**Access Rules:**
- Public spaces visible to all members
- Private spaces visible to owner, allowed users, and admins

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Engineering Docs",
      "description": "Technical documentation and guides",
      "is_public": false,
      "owner_email": "john@acme.com",
      "allowed_users": ["jane@acme.com", "bob@acme.com"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/spaces

Create a new space.

**Authentication:** Required
**Permissions:** Manager or Admin

**Request Body:**
```json
{
  "name": "Engineering Docs",
  "description": "Technical documentation",
  "is_public": false,
  "allowed_users": ["jane@acme.com"]
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Engineering Docs",
    "owner_email": "john@acme.com",
    "created_at": "2024-01-05T12:00:00.000Z"
  }
}
```

### GET /orgs/:orgId/spaces/:id

Get a specific space.

**Authentication:** Required
**Permissions:** Must have access (public, owner, allowed user, or admin)

### PUT /orgs/:orgId/spaces/:id

Update a space.

**Authentication:** Required
**Permissions:** Owner or Admin

**Request Body:**
```json
{
  "name": "Updated name",
  "is_public": true,
  "allowed_users": ["jane@acme.com", "bob@acme.com"]
}
```

### DELETE /orgs/:orgId/spaces/:id

Delete a space.

**Authentication:** Required
**Permissions:** Owner or Admin

---

## Announcements

Company-wide announcements.

### GET /orgs/:orgId/announcements

List all announcements.

**Authentication:** Required
**Permissions:** Organization member

**Query Parameters:**
- `category` - Filter: `general`, `product`, `hr`, `social`, `urgent`
- `sortBy` - Sort field: `created_at`, `-created_at`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Q1 Kickoff Meeting",
      "content": "Join us for Q1 planning...",
      "category": "general",
      "author_email": "john@acme.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/announcements

Create a new announcement.

**Authentication:** Required
**Permissions:** Manager or Admin

**Request Body:**
```json
{
  "title": "Q1 Kickoff Meeting",
  "content": "Join us for Q1 planning...",
  "category": "general"
}
```

### GET /orgs/:orgId/announcements/:id

Get a specific announcement.

### PUT /orgs/:orgId/announcements/:id

Update an announcement.

**Authentication:** Required
**Permissions:** Author or Admin

### DELETE /orgs/:orgId/announcements/:id

Delete an announcement.

**Authentication:** Required
**Permissions:** Author or Admin

---

## Comments

Comments on various entities (decisions, tasks, announcements).

### GET /orgs/:orgId/comments

List comments for an entity.

**Authentication:** Required
**Permissions:** Organization member with access to parent entity

**Query Parameters:**
- `entity_type` - **Required**: `decision`, `task`, `announcement`, `space`
- `entity_id` - **Required**: UUID of parent entity
- `sortBy` - Sort field: `created_at`, `-created_at`

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_type": "decision",
      "entity_id": "456e7890-e89b-12d3-a456-426614174000",
      "content": "Great idea! I support this.",
      "author_email": "jane@acme.com",
      "created_at": "2024-01-05T12:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/comments

Create a new comment.

**Authentication:** Required
**Permissions:** Organization member with access to parent entity

**Request Body:**
```json
{
  "entity_type": "decision",
  "entity_id": "456e7890-e89b-12d3-a456-426614174000",
  "content": "Great idea! I support this."
}
```

### GET /orgs/:orgId/comments/:id

Get a specific comment.

### PUT /orgs/:orgId/comments/:id

Update a comment.

**Authentication:** Required
**Permissions:** Author or Admin

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

### DELETE /orgs/:orgId/comments/:id

Delete a comment.

**Authentication:** Required
**Permissions:** Author or Admin

---

## Leave Requests

Employee time-off management.

### GET /orgs/:orgId/leave-requests

List leave requests.

**Authentication:** Required
**Permissions:** Organization member

**Query Parameters:**
- `status` - Filter: `pending`, `approved`, `rejected`
- `type` - Filter: `vacation`, `sick`, `personal`, `other`
- `user_email` - Filter by requester

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_email": "jane@acme.com",
      "type": "vacation",
      "start_date": "2024-02-01",
      "end_date": "2024-02-07",
      "reason": "Family vacation",
      "status": "pending",
      "reviewed_by": null,
      "reviewed_at": null,
      "created_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/leave-requests

Create a leave request.

**Authentication:** Required
**Permissions:** Organization member

**Request Body:**
```json
{
  "type": "vacation",
  "start_date": "2024-02-01",
  "end_date": "2024-02-07",
  "reason": "Family vacation"
}
```

### GET /orgs/:orgId/leave-requests/:id

Get a specific leave request.

### PUT /orgs/:orgId/leave-requests/:id

Update a leave request (before approval).

**Authentication:** Required
**Permissions:** Requester only

**Request Body:**
```json
{
  "start_date": "2024-02-02",
  "reason": "Updated reason"
}
```

### DELETE /orgs/:orgId/leave-requests/:id

Delete a leave request (before approval).

**Authentication:** Required
**Permissions:** Requester only

### PUT /orgs/:orgId/leave-requests/:id/review

Approve or reject a leave request.

**Authentication:** Required
**Permissions:** Manager or Admin

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid statuses:** `approved`, `rejected`

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "approved",
    "reviewed_by": "john@acme.com",
    "reviewed_at": "2024-01-05T12:00:00.000Z"
  }
}
```

---

## Holidays

Company holiday calendar.

### GET /orgs/:orgId/holidays

List all holidays for the organization.

**Authentication:** Required
**Permissions:** Organization member

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "New Year's Day",
      "date": "2024-01-01",
      "description": "First day of the year",
      "created_at": "2023-12-01T00:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/holidays

Create a new holiday.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "name": "Independence Day",
  "date": "2024-07-04",
  "description": "National holiday"
}
```

### GET /orgs/:orgId/holidays/:id

Get a specific holiday.

### PUT /orgs/:orgId/holidays/:id

Update a holiday.

**Authentication:** Required
**Permissions:** Admin only

### DELETE /orgs/:orgId/holidays/:id

Delete a holiday.

**Authentication:** Required
**Permissions:** Admin only

---

## Time Entries

Time tracking for tasks and projects.

### GET /orgs/:orgId/time-entries

List time entries.

**Authentication:** Required
**Permissions:** Organization member (own entries), Manager/Admin (all entries)

**Query Parameters:**
- `user_email` - Filter by user
- `task_id` - Filter by task
- `start_date` - Filter entries after date (ISO format)
- `end_date` - Filter entries before date (ISO format)
- `sortBy` - Sort field: `date`, `-date`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_email": "jane@acme.com",
      "task_id": "456e7890-e89b-12d3-a456-426614174000",
      "date": "2024-01-05",
      "hours": 4.5,
      "description": "Implemented login page",
      "created_at": "2024-01-05T18:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/time-entries

Log time for a task.

**Authentication:** Required
**Permissions:** Organization member

**Request Body:**
```json
{
  "task_id": "456e7890-e89b-12d3-a456-426614174000",
  "date": "2024-01-05",
  "hours": 4.5,
  "description": "Implemented login page"
}
```

**Notes:**
- Task must exist and user must have access
- Hours must be positive

### GET /orgs/:orgId/time-entries/:id

Get a specific time entry.

### PUT /orgs/:orgId/time-entries/:id

Update a time entry.

**Authentication:** Required
**Permissions:** Entry owner or Admin

### DELETE /orgs/:orgId/time-entries/:id

Delete a time entry.

**Authentication:** Required
**Permissions:** Entry owner or Admin

---

## Billing Tools

Subscription and usage tracking.

**All billing endpoints require Admin role.**

### GET /orgs/:orgId/billing-tools

Get billing information for the organization.

**Authentication:** Required
**Permissions:** Admin only

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "plan": "professional",
      "status": "active",
      "seats": 25,
      "billing_email": "billing@acme.com",
      "next_billing_date": "2024-02-01",
      "mrr": 999.00,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/billing-tools

Create billing record.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "plan": "professional",
  "seats": 25,
  "billing_email": "billing@acme.com",
  "mrr": 999.00
}
```

### GET /orgs/:orgId/billing-tools/:id

Get specific billing record.

**Authentication:** Required
**Permissions:** Admin only

### PUT /orgs/:orgId/billing-tools/:id

Update billing information.

**Authentication:** Required
**Permissions:** Admin only

**Request Body:**
```json
{
  "seats": 30,
  "mrr": 1199.00,
  "status": "active"
}
```

### DELETE /orgs/:orgId/billing-tools/:id

Delete billing record.

**Authentication:** Required
**Permissions:** Admin only

---

## Milestones

Project milestones and roadmap tracking.

### GET /orgs/:orgId/milestones

List all milestones.

**Authentication:** Required
**Permissions:** Organization member

**Query Parameters:**
- `status` - Filter: `planned`, `in_progress`, `completed`, `delayed`
- `sortBy` - Sort: `target_date`, `-target_date`, `created_at`, etc.

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "MVP Launch",
      "description": "Launch minimum viable product",
      "target_date": "2024-03-01",
      "status": "in_progress",
      "owner_email": "john@acme.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-05T12:00:00.000Z"
    }
  ]
}
```

### POST /orgs/:orgId/milestones

Create a new milestone.

**Authentication:** Required
**Permissions:** Manager or Admin

**Request Body:**
```json
{
  "title": "MVP Launch",
  "description": "Launch minimum viable product",
  "target_date": "2024-03-01",
  "status": "planned"
}
```

### GET /orgs/:orgId/milestones/:id

Get a specific milestone.

### PUT /orgs/:orgId/milestones/:id

Update a milestone.

**Authentication:** Required
**Permissions:** Owner, Manager, or Admin

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "completed",
  "target_date": "2024-03-15"
}
```

### DELETE /orgs/:orgId/milestones/:id

Delete a milestone.

**Authentication:** Required
**Permissions:** Owner, Manager, or Admin

---

## Error Codes

**Common HTTP Status Codes:**

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  }
}
```

**Custom Error Codes:**
- `UNAUTHORIZED` - Authentication failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Resource conflict
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

Currently not implemented. Will be added in future versions.

**Recommended limits:**
- 100 requests per minute per user
- 1000 requests per hour per organization

---

## Pagination

Currently not implemented for list endpoints. All results are returned.

**Future implementation:**
```
GET /orgs/:orgId/tasks?page=1&limit=50
```

**Response will include:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "pages": 5
  }
}
```

---

## Webhooks

Not currently implemented.

**Planned events:**
- `decision.created`
- `decision.voted`
- `task.created`
- `task.updated`
- `member.added`
- `member.removed`

---

## SDK Usage Examples

### JavaScript/TypeScript

```javascript
import { httpClient } from '@/api/httpClient';

// List tasks
const tasks = await httpClient.Task.list();

// Create task
const newTask = await httpClient.Task.create({
  title: 'Implement feature',
  priority: 'high',
  due_date: '2024-01-15'
});

// Update task
await httpClient.Task.update(taskId, {
  status: 'done'
});

// Delete task
await httpClient.Task.delete(taskId);
```

### Direct HTTP Requests

```bash
# List organizations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/orgs

# Create task
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New task","priority":"high"}' \
  http://localhost:3001/api/orgs/ORG_ID/tasks

# Update decision
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"voting"}' \
  http://localhost:3001/api/orgs/ORG_ID/decisions/DECISION_ID
```

---

## Testing

Use the provided mock data for testing:

1. **Switch to HTTP client** in development mode using the UI switcher
2. **Start the backend:** `cd backend && npm run dev`
3. **Login** with a test user from Clerk
4. **Make requests** through the frontend

**Test users should have:**
- Valid Clerk account
- Membership in at least one organization
- Appropriate role for testing permissions

---

## Deployment

See deployment documentation for:
- Environment variable setup
- Database migrations
- SSL/TLS configuration
- Production optimizations

---

## Support

For issues or questions:
- Check error messages in responses
- Review permission requirements
- Verify authentication token
- Check organization membership

**Common issues:**
- `401 Unauthorized` - Check Clerk token is valid and not expired
- `403 Forbidden` - Verify user has required role
- `404 Not Found` - Check orgId and resource ID are correct
- `500 Internal Error` - Check backend logs for details
