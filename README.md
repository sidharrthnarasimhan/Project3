# Startup OS

A team collaboration platform built with Vite + React. This app runs completely locally using mock data stored in localStorage.

## Features

- **Decisions**: Track and participate in team decisions
- **Tasks**: Manage action items and follow-ups
- **Announcements**: Share important updates with the team
- **People**: Team directory and leave management
- **Settings**: Configure your preferences

## Running the app

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Building the app

```bash
npm run build
```

## Authentication & Users

The app includes a complete authentication system with role-based access control.

### Demo Users

You can log in with any of these demo accounts:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@example.com | admin123 | Admin | Full access to all pages + permission management |
| manager@example.com | manager123 | Manager | Access to most pages |
| john@example.com | john123 | Member | Access to core features |
| guest@example.com | guest123 | Guest | Limited access to basic pages |

### Features

**Login System**
- Secure login with email and password
- Automatic session persistence via localStorage
- Easy quick-login buttons for demo accounts

**Role-Based Access Control**
- Different user roles with different permissions
- Page-level access restrictions
- Navigation automatically hides inaccessible pages
- Access Denied page for unauthorized access attempts

**Admin Features** (admin@example.com only)
- Access Control settings in Settings → Access Control tab
- Configure which roles can access each page
- Real-time permission updates
- Admins always have full access

## Local Development

This app uses localStorage for data persistence. All data is stored locally in your browser.

**To reset data:**
- Clear your browser's localStorage
- Use browser developer tools
- Or call `resetData()` from console after importing from `src/api/mockData.js`

**Sessions persist** across page reloads until you explicitly log out.