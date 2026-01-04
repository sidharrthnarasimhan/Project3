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
        setData(data);
        resolve(userWithoutPassword);
      }, 300); // Slightly longer delay to simulate network
    });
  },

  // Logout
  logout() {
    const data = getData();
    data.currentUser = null;
    setData(data);

    // Reload the page to reset state
    window.location.href = '/';
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
