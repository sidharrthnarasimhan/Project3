# Startup OS Backend

Node.js backend API for Startup OS using Fastify, PostgreSQL, and Clerk authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - DATABASE_URL: Your PostgreSQL connection string (Neon, Supabase, or local)
   - CLERK_SECRET_KEY: From Clerk dashboard
   - CLERK_PUBLISHABLE_KEY: From Clerk dashboard

4. Run database migrations:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

## API Structure

All APIs are organization-scoped:

- `GET/POST /orgs/:orgId/decisions`
- `GET/POST /orgs/:orgId/tasks`
- `GET/POST /orgs/:orgId/announcements`
- `GET/POST /orgs/:orgId/spaces`
- And more...

## Authentication

Uses Clerk JWT tokens. Frontend must include `Authorization: Bearer <token>` header on all requests.

## Deployment

- **Database:** Neon PostgreSQL (recommended) or Supabase
- **Backend:** Render.com or Fly.io
- **Environment:** Set all `.env` variables in hosting platform
