# Startup OS - Setup & Running Guide

This guide explains how to run the Startup OS application in both **Mock Mode** (no backend) and **Production Mode** (with backend).

---

## Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** database (for production mode)
- **Clerk** account (for production mode authentication)

---

## Quick Start - Mock Mode (No Backend Required)

This is the easiest way to get started. The app runs entirely in the browser using localStorage.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Open the App

Open your browser to: **http://localhost:5173**

### 4. Login

Use one of the demo accounts:
- **Admin:** admin@startup.com / password123
- **Manager:** manager@startup.com / password123
- **Member:** member@startup.com / password123
- **Guest:** guest@startup.com / password123

**Note:** The app is using mock data stored in localStorage. All data persists in your browser.

---

## Production Mode - With Backend

To use the real backend API with PostgreSQL and Clerk authentication:

### Part 1: Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

2. **Create Database**

```bash
# Login to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE startup_os;
CREATE USER startup_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE startup_os TO startup_user;
\q
```

#### Option B: Cloud PostgreSQL (Recommended for Production)

Use **Neon** or **Supabase** for hosted PostgreSQL:

**Neon:** https://neon.tech
**Supabase:** https://supabase.com

Both offer free tiers and provide a connection string like:
```
postgresql://user:password@host.region.neon.tech/dbname?sslmode=require
```

### Part 2: Clerk Authentication Setup

1. **Create Clerk Account:** https://clerk.com
2. **Create a new application** in Clerk dashboard
3. **Get your keys:**
   - Publishable Key (starts with `pk_test_` or `pk_live_`)
   - Secret Key (starts with `sk_test_` or `sk_live_`)

4. **Add test users** in Clerk dashboard or allow sign-ups

### Part 3: Backend Setup

1. **Navigate to backend folder**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Edit `.env` file** with your credentials

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/startup_os

# Clerk
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Server
PORT=3001
NODE_ENV=development

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

5. **Run database migrations**

```bash
npm run migrate
```

This creates all the necessary tables in your database.

6. **Start the backend server**

```bash
npm run dev
```

You should see:
```
Server listening at http://0.0.0.0:3001
```

**Keep this terminal running.**

### Part 4: Frontend Setup for Production Mode

1. **Open a new terminal** and navigate to project root

```bash
cd /Users/sidharrthnarasimhan/Project3
```

2. **Create/update `.env` file** in the root directory

```bash
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Environment
VITE_ENV=development
```

3. **Install frontend dependencies** (if not already done)

```bash
npm install
```

4. **Start the frontend**

```bash
npm run dev
```

5. **Open the app:** http://localhost:5173

6. **Switch to HTTP Client**

In the bottom-right corner, you'll see a button that says **"Mock Client"** or **"HTTP Client"**.

Click it and select **"HTTP Client (Real API)"**. The page will reload.

7. **Login with Clerk**

Now the app will use real Clerk authentication. Sign in with:
- A user you created in Clerk dashboard, OR
- Sign up for a new account (if you enabled sign-ups in Clerk)

---

## Running the Full Stack

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Browser:**
- Open http://localhost:5173
- Click "HTTP Client" switcher in bottom-right
- Login with Clerk

---

## Switching Between Mock and Production

You can switch between modes at any time using the **Client Switcher** button in the bottom-right corner (only visible in development).

### Mock Mode (localStorage)
- ✅ No backend required
- ✅ No database needed
- ✅ No Clerk account needed
- ✅ Instant setup
- ❌ Data only in browser
- ❌ No real authentication

### Production Mode (HTTP Client)
- ✅ Real database persistence
- ✅ Real user authentication
- ✅ Multi-tenant organizations
- ✅ Production-ready
- ❌ Requires backend setup
- ❌ Requires database
- ❌ Requires Clerk account

---

## Creating Your First Organization (Production Mode)

After logging in with the HTTP client:

1. The app will check if you belong to any organizations
2. If not, you'll need to create one via API or database

**Option 1: Create via API (recommended)**

Open browser console and run:
```javascript
const token = await clerk.session.getToken();
const response = await fetch('http://localhost:3001/api/orgs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Company',
    slug: 'my-company'
  })
});
const org = await response.json();
console.log(org);
```

**Option 2: Insert directly into database**

```sql
-- Get your Clerk user ID from the Clerk dashboard
-- Then insert organization and membership

INSERT INTO organizations (name, slug)
VALUES ('My Company', 'my-company')
RETURNING id;

-- Use the returned ID and your Clerk user ID
INSERT INTO memberships (organization_id, user_id, role)
VALUES ('org-uuid-here', 'clerk-user-id-here', 'admin');
```

---

## Troubleshooting

### Frontend won't start

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't connect to database

- Check `DATABASE_URL` in `backend/.env`
- Verify PostgreSQL is running: `pg_isready`
- Test connection: `psql $DATABASE_URL`

### Clerk authentication fails

- Verify `VITE_CLERK_PUBLISHABLE_KEY` in root `.env`
- Verify `CLERK_SECRET_KEY` in `backend/.env`
- Check Clerk dashboard for correct keys
- Ensure keys match the same Clerk application

### "No organizations found" error

- Create an organization using one of the methods above
- Verify your Clerk user ID matches the membership record
- Check database: `SELECT * FROM memberships WHERE user_id = 'your-clerk-id';`

### CORS errors

- Ensure `FRONTEND_URL=http://localhost:5173` in `backend/.env`
- Restart backend after changing `.env`
- Check browser console for specific CORS error

### Port already in use

```bash
# Frontend (5173)
lsof -ti:5173 | xargs kill -9

# Backend (3001)
lsof -ti:3001 | xargs kill -9
```

---

## Available Scripts

### Frontend (root directory)

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Backend (backend directory)

```bash
npm run dev          # Start with auto-reload
npm start            # Start production server
npm run migrate      # Run database migrations
```

---

## Development Workflow

### 1. Start with Mock Mode
- Rapid prototyping
- No backend needed
- Test UI/UX

### 2. Switch to Production Mode
- Test real authentication
- Test API integration
- Test database operations

### 3. Deploy
- Frontend to Vercel
- Backend to Render/Fly.io
- Database on Neon/Supabase

---

## Next Steps

1. **Start in Mock Mode** to explore the app
2. **Set up backend** when you need real data
3. **Configure Clerk** for production auth
4. **Create organizations** and invite team members
5. **Customize** the app for your needs

---

## Getting Help

- **API Documentation:** See `backend/API_DOCUMENTATION.md`
- **Project Overview:** See `CLAUDE.md`
- **Database Schema:** See `backend/src/db/schema.sql`

---

## Production Deployment

Coming soon! The next tasks will create deployment configurations for:
- Backend on Render or Fly.io
- Frontend on Vercel
- Database on Neon or Supabase
