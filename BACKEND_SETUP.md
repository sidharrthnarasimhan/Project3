# Backend Setup - Step by Step Guide

Follow these steps to set up the real backend with database and authentication.

---

## Option 1: Quick Setup with Cloud Services (Recommended - Easiest)

This is the fastest way to get the backend running without installing PostgreSQL locally.

### Step 1: Create a Neon Database (Free)

1. Go to **https://neon.tech**
2. Sign up for a free account
3. Click **"Create Project"**
4. Name it: "startup-os"
5. Select a region close to you
6. Click **"Create Project"**
7. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
8. Keep this tab open - you'll need this URL

### Step 2: Create a Clerk Account (Free)

1. Go to **https://clerk.com**
2. Sign up for a free account
3. Click **"Create Application"**
4. Name it: "Startup OS"
5. Select authentication methods (Email, Google, etc.)
6. Click **"Create Application"**
7. You'll see your API keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
8. **Copy both keys** - keep this page open

### Step 3: Configure Backend

Open a terminal and run:

```bash
cd backend

# Create .env file from example
cp .env.example .env

# Open .env file in your editor
# On macOS:
open .env

# On Linux:
nano .env
# or
code .env
```

**Edit the `.env` file** and paste your actual values:

```bash
# Paste the Neon connection string you copied
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Paste the Clerk secret key
CLERK_SECRET_KEY=sk_test_your_actual_key_from_clerk

# Paste the Clerk publishable key
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_from_clerk

# Keep these as-is
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Save the file.**

### Step 4: Install Dependencies and Run Migrations

```bash
# Install backend dependencies
npm install

# Run database migrations (creates all tables)
npm run migrate
```

You should see output like:
```
✓ Created users table
✓ Created organizations table
✓ Created memberships table
...
✓ All migrations completed successfully!
```

### Step 5: Start the Backend

```bash
npm run dev
```

You should see:
```
[INFO] Server listening at http://0.0.0.0:3001
```

**✅ Backend is now running!** Keep this terminal open.

### Step 6: Update Frontend Environment

Open a **new terminal** in the project root:

```bash
cd /Users/sidharrthnarasimhan/Project3

# Edit the .env file
open .env
# or
nano .env
```

Update with your Clerk publishable key:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_from_clerk
VITE_ENV=development
```

**Save the file.**

### Step 7: Restart Frontend

Stop the frontend (Ctrl+C in the terminal running it) and start it again:

```bash
npm run dev
```

### Step 8: Switch to HTTP Client

1. Open **http://localhost:5173**
2. Look for the **button in the bottom-right corner** (it says "Mock Client")
3. **Click it**
4. Select **"HTTP Client (Real API)"**
5. Page will reload

### Step 9: Sign Up / Login

1. You'll see the Clerk login screen
2. **Sign up** for a new account or **login** if you already have one
3. Use any email/password or sign in with Google (if you enabled it in Clerk)

### Step 10: Create Your First Organization

After logging in, you need to create an organization. Open the **browser console** (F12 → Console tab) and run:

```javascript
const token = await window.Clerk.session.getToken();
const response = await fetch('http://localhost:3001/api/orgs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Company',
    slug: 'my-company',
    logo_url: ''
  })
});
const org = await response.json();
console.log('Organization created:', org);
```

Refresh the page - you should now see your organization!

---

## Option 2: Local PostgreSQL Setup (For Advanced Users)

If you want to run PostgreSQL locally instead of using Neon:

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE startup_os;
CREATE USER startup_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE startup_os TO startup_user;
\q
```

### Step 3: Configure Backend

Edit `backend/.env`:

```bash
DATABASE_URL=postgresql://startup_user:your_secure_password@localhost:5432/startup_os
CLERK_SECRET_KEY=sk_test_your_key_from_clerk
CLERK_PUBLISHABLE_KEY=pk_test_your_key_from_clerk
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Then follow **Steps 4-10** from Option 1 above.

---

## Troubleshooting

### Error: "Cannot connect to database"

- **Check DATABASE_URL** is correct
- **For Neon:** Make sure `?sslmode=require` is at the end
- **For local:** Make sure PostgreSQL is running: `pg_isready`

### Error: "Clerk authentication failed"

- **Check CLERK_SECRET_KEY** in `backend/.env`
- **Check VITE_CLERK_PUBLISHABLE_KEY** in root `.env`
- Make sure both keys are from the **same Clerk application**
- Restart both frontend and backend after changing .env files

### Error: "Port 3001 already in use"

```bash
# Kill the process on port 3001
lsof -ti:3001 | xargs kill -9

# Try starting backend again
npm run dev
```

### Can't switch to HTTP Client - button not showing

- The button only shows in **development mode**
- Make sure `VITE_ENV=development` in your `.env`
- Restart the frontend

### "No organizations found" after login

- Run the organization creation script from Step 10
- Or create organization via database/API

---

## What's Running?

After setup you should have:

**Terminal 1 - Backend:**
```
[INFO] Server listening at http://0.0.0.0:3001
```

**Terminal 2 - Frontend:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**Browser:**
- Frontend at http://localhost:5173
- Logged in with Clerk
- Using HTTP Client (not Mock)
- Organization created

---

## Next Steps

- Invite team members via Clerk dashboard
- Add members to your organization via API or database
- Start creating tasks, decisions, announcements, etc.
- Everything now persists in the real database!

---

## Quick Reference

**Backend logs:** Check the terminal running `npm run dev` in backend/
**Frontend logs:** Check browser console (F12)
**Database:** View in Neon dashboard or connect with psql
**Authentication:** Manage users in Clerk dashboard
