import { getData, setData } from './mockData';

// Mock authentication system
export const auth = {
  // Get current user
  me() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getData();

        if (data.currentUser) {
          resolve(data.currentUser);
        } else {
          reject(new Error('Not authenticated'));
        }
      }, 100);
    });
  },

  // Login with email and password
  login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getData();
        const user = data.users.find(u => u.email === email);

        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        if (user.password !== password) {
          reject(new Error('Invalid password'));
          return;
        }

        // Don't store password in currentUser
        const { password: _, ...userWithoutPassword } = user;
        data.currentUser = userWithoutPassword;

        // Auto-start timer for non-managers (members and guests)
        if (user.role === 'member' || user.role === 'guest') {
          if (!data.activeTimers) {
            data.activeTimers = {};
          }
          // Only start if not already running
          if (!data.activeTimers[user.email]) {
            data.activeTimers[user.email] = {
              start_time: new Date().toISOString(),
            };
          }
        }

        setData(data);
        resolve(userWithoutPassword);
      }, 300); // Slightly longer delay to simulate network
    });
  },

  // Logout
  logout() {
    const data = getData();
    const currentUser = data.currentUser;

    // If user has an active timer, stop it and save the time entry
    if (currentUser && data.activeTimers && data.activeTimers[currentUser.email]) {
      const activeTimer = data.activeTimers[currentUser.email];
      const startTime = new Date(activeTimer.start_time);
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Only save if duration is at least 1 minute
      if (duration >= 60000) {
        // Create time entry directly
        if (!data.timeEntries) {
          data.timeEntries = [];
        }

        const newEntry = {
          id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration,
          created_date: new Date().toISOString(),
        };

        data.timeEntries.push(newEntry);
      }

      // Remove active timer
      delete data.activeTimers[currentUser.email];
    }

    data.currentUser = null;
    setData(data);

    // Force reload the page to reset state
    window.location.reload();
  },

  // Get current user synchronously
  getCurrentUser() {
    const data = getData();
    return data.currentUser;
  },

  // Check if user has permission to access a page
  hasPageAccess(pageName) {
    const data = getData();
    const currentUser = data.currentUser;

    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admins always have access

    const permissions = data.pagePermissions || {};
    const allowedRoles = permissions[pageName] || [];

    return allowedRoles.includes(currentUser.role);
  },

  // Update page permissions (admin only)
  updatePagePermissions(pageName, allowedRoles) {
    const data = getData();

    if (!data.currentUser || data.currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update permissions');
    }

    if (!data.pagePermissions) {
      data.pagePermissions = {};
    }

    data.pagePermissions[pageName] = allowedRoles;
    setData(data);

    return data.pagePermissions;
  },

  // Get all page permissions
  getPagePermissions() {
    const data = getData();
    return data.pagePermissions || {};
  },
};
