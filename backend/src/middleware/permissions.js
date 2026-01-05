import { ForbiddenError } from '../utils/errors.js';

/**
 * Check if user can access a specific resource
 * Used for entity-level permissions (e.g., can user edit this space?)
 */
export const canAccessResource = (resource, action = 'read') => {
  return async (request, reply) => {
    const { user } = request;

    if (!user) {
      throw new ForbiddenError('User context required');
    }

    // Admins can do everything
    if (user.role === 'admin') {
      return;
    }

    // Resource-specific permission checks
    switch (resource) {
      case 'space':
        await checkSpaceAccess(request, action);
        break;

      case 'billing':
        // Only admins can access billing
        throw new ForbiddenError('Admin access required for billing');

      case 'people':
        // Managers and admins can access people
        if (!['admin', 'manager'].includes(user.role)) {
          throw new ForbiddenError('Manager access required for people management');
        }
        break;

      default:
        // For most resources, check if user is at least a member
        if (user.role === 'guest' && action !== 'read') {
          throw new ForbiddenError('Guests can only read content');
        }
    }
  };
};

/**
 * Check space-specific access
 */
async function checkSpaceAccess(request, action) {
  const { user, params } = request;
  const spaceId = params.spaceId || params.id;

  // If reading, any authenticated user in the org might have access
  // (checked by space visibility rules)
  if (action === 'read') {
    return;
  }

  // For write/delete actions, need to be space owner or admin
  // This will be enforced at the API level by checking space ownership
  return;
}

/**
 * Check if user owns a resource
 */
export const requireOwnership = (ownerField = 'owner_email') => {
  return (request, resource) => {
    const { user } = request;

    if (!user) {
      throw new ForbiddenError('User context required');
    }

    // Admins can access anything
    if (user.role === 'admin') {
      return true;
    }

    // Check if user owns the resource
    const ownerEmail = resource[ownerField];
    if (ownerEmail !== user.email) {
      throw new ForbiddenError('Only the owner can perform this action');
    }

    return true;
  };
};

/**
 * Check if user can modify a resource based on role
 */
export const canModifyResource = (requiredRole = 'member') => {
  return async (request, reply) => {
    const { user } = request;

    if (!user) {
      throw new ForbiddenError('User context required');
    }

    const roleHierarchy = {
      guest: 0,
      member: 1,
      manager: 2,
      admin: 3,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(`${requiredRole} role or higher required`);
    }
  };
};
