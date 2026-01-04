# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application built with Vite. It's a "Startup OS" application that provides team collaboration features including decisions, tasks, announcements, and people management. The app runs completely locally using mock data stored in localStorage.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Local Data Architecture

The app uses a mock data layer that stores all data in browser localStorage, making it fully functional without any backend server.

**API Layer Structure:**
- `src/api/mockData.js` - localStorage-based data persistence with default seed data, page permissions, and data versioning (increment `DATA_VERSION` when schema changes)
- `src/api/mockEntities.js` - Generic `Entity` class providing CRUD operations (list, get, create, update, delete) with 100ms simulated network delay
- `src/api/mockAuth.js` - Mock authentication system with login/logout, permission checking, and automatic time tracking
- `src/api/localClient.js` - Local client that mimics the original SDK structure, exposing `auth`, `entities`, and `integrations`
- `src/api/base44Client.js` - Re-exports the local client as `base44` for backwards compatibility
- `src/api/entities.js` - Exports entity models (Decision, Task, Announcement, LeaveRequest, Comment, User, Holiday, TimeEntry)
- `src/api/integrations.js` - Exports integration utilities (currently mocked with console logs)

**Authentication & Permissions:**
- `src/pages/Login.jsx` - Login page with demo user quick-login
- `src/components/common/ProtectedRoute.jsx` - Route guard component that checks permissions
- User sessions stored in localStorage under `startup_os_data.currentUser`
- Page permissions stored in `startup_os_data.pagePermissions`

### Routing Architecture

The app uses React Router with a custom routing system:

1. **Page Registration:** All pages are registered in `src/pages/index.jsx` in the `PAGES` object
2. **Route Definition:** Routes are defined in the same file using React Router's `<Routes>` and `<Route>` components
3. **URL Mapping:** The `_getCurrentPage()` helper function maps URLs to page names by extracting the last URL segment
4. **Navigation:** Use `createPageUrl(pageName)` from `src/utils/index.ts` to generate proper page URLs throughout the app

**To add a new page:**
1. Create the page component in `src/pages/YourPage.jsx`
2. Add it to the `PAGES` object in `src/pages/index.jsx`
3. Add a `<Route>` element in the `<Routes>` section
4. Import and add it at the top of the file
5. Optionally add a nav item to `src/pages/Layout.jsx` navItems array

### Component Structure

- `src/components/ui/` - Shadcn/ui components (Dialog, Button, Avatar, etc.)
- `src/components/common/` - Shared application components
- `src/components/{domain}/` - Feature-specific components organized by domain (announcements, decisions, tasks, people, dashboard)
- `src/pages/` - Page-level components that compose UI components and handle routing
- `src/pages/Layout.jsx` - Main layout wrapper with navigation, header, and user menu

### UI Framework

The app uses:
- **Tailwind CSS** for styling with a custom configuration in `tailwind.config.js`
- **Shadcn/ui** components based on Radix UI primitives
- **Lucide React** for icons
- **Framer Motion** for animations where needed
- The `cn()` utility from `src/lib/utils.js` for conditional class merging (combines clsx and tailwind-merge)

### Path Aliasing

Vite is configured with `@` aliasing to `./src` directory. All imports should use `@/` prefix:
```javascript
import { Button } from '@/components/ui/button'
import { base44 } from '@/api/base44Client'
```

### Authentication & Authorization Flow

**Authentication:**
- User authentication is handled via the mock auth system in `src/api/mockAuth.js`
- Login page (`src/pages/Login.jsx`) is shown when user is not authenticated
- Users must provide email and password to log in
- Current user is fetched using `base44.auth.me()`
- Logout is handled via `base44.auth.logout()` which clears the session, auto-saves time entries (if timer running), and reloads the page
- Session persists in localStorage across page reloads
- **Time Tracking:** Members and guests automatically start a timer on login; timer is saved to `timeEntries` on logout (if duration ≥ 1 minute)

**Authorization (Role-Based Access Control):**
- User roles: `admin`, `manager`, `member`, `guest`
- Page permissions are configured in `mockData.js` under `pagePermissions`
- The `ProtectedRoute` component (`src/components/common/ProtectedRoute.jsx`) guards page access
- Navigation items automatically hide if user lacks access
- `base44.auth.hasPageAccess(pageName)` checks if current user can access a page
- Admins always have full access to all pages

**Admin Features:**
- Admins can manage page permissions via Settings → Access Control tab
- `base44.auth.updatePagePermissions(pageName, allowedRoles)` updates permissions
- `base44.auth.getPagePermissions()` retrieves all page permissions
- Changes take effect immediately

## Key Patterns

### Page Component Pattern
Pages should be functional components that:
1. Use Base44 SDK entities for data operations
2. Compose UI components from `src/components/ui/` and domain-specific components
3. Handle their own data fetching and state management
4. Are wrapped by the Layout component via the routing system
5. Are protected by ProtectedRoute component which checks user permissions

**Adding a new page:**
1. Create page component in `src/pages/`
2. Add to PAGES object in `src/pages/index.jsx`
3. Add route with ProtectedRoute wrapper
4. Add page name to `pagePermissions` in `src/api/mockData.js` with allowed roles
5. Optionally add to navItems in `src/pages/Layout.jsx` for navigation

### Component Naming
- UI components use JSX extension
- Utility functions use TS extension
- Keep component files in appropriate domain folders

### State Management & Data Fetching

The app uses:
- **React Query (@tanstack/react-query)** for server state management and caching
- **React hooks** (useState, useEffect) for local component state
- **localStorage** for data persistence across sessions

All entity operations return Promises with simulated network delay (100ms) to mimic real API behavior.

### Data Persistence

- All data is stored in localStorage under the key `startup_os_data`
- Default seed data includes sample users, tasks, decisions, announcements, leave requests, holidays, time entries, and company settings
- Data includes a `version` field (currently `DATA_VERSION = 3`) for migration support - old data is automatically reset when version changes
- To reset data to defaults, clear localStorage or call `resetData()` from `src/api/mockData.js` in the console
- Data persists across page reloads

### Company Branding

- Company name and logo are stored in `companySettings` in localStorage
- Admins can update company branding via Settings → Company tab
- Logo upload uses base64 data URLs for storage
- Layout component (`src/pages/Layout.jsx`) listens for `companySettingsUpdated` custom event to reactively update branding
