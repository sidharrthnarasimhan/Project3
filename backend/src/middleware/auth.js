import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Clerk authentication middleware
 * Verifies JWT token and adds auth info to request
 */
export const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Custom authentication middleware that extracts user info
 * Must be used after requireAuth
 */
export const authenticate = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // In production, verify token with Clerk
    // For now, we'll extract claims from the token
    // You'll need to add proper Clerk JWT verification here

    // Placeholder: Extract user ID from token
    // In real implementation, use Clerk's verifyToken() method
    const clerkUserId = extractClerkUserId(token);

    if (!clerkUserId) {
      throw new UnauthorizedError('Invalid token');
    }

    // Attach clerk user ID to request for downstream use
    request.clerkUserId = clerkUserId;

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Authentication failed');
  }
};

/**
 * Middleware to resolve organization context
 * Extracts orgId from route params and validates user membership
 */
export const resolveOrganization = async (request, reply, db) => {
  const { orgId } = request.params;

  if (!orgId) {
    throw new ForbiddenError('Organization ID required');
  }

  // Query database to get user info and membership
  const query = `
    SELECT
      u.id as user_id,
      u.email,
      u.full_name,
      m.role,
      m.organization_id
    FROM users u
    JOIN memberships m ON u.id = m.user_id
    WHERE u.clerk_user_id = $1 AND m.organization_id = $2
  `;

  const result = await db.query(query, [request.clerkUserId, orgId]);

  if (result.rows.length === 0) {
    throw new ForbiddenError('Access denied to this organization');
  }

  const membership = result.rows[0];

  // Attach organization context to request
  request.orgId = orgId;
  request.user = {
    id: membership.user_id,
    email: membership.email,
    fullName: membership.full_name,
    role: membership.role,
  };
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles) => {
  return async (request, reply) => {
    if (!request.user) {
      throw new UnauthorizedError('User context not found');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(`Required role: ${allowedRoles.join(' or ')}`);
    }
  };
};

/**
 * Middleware to check page access permissions
 */
export const checkPageAccess = (pageName) => {
  return async (request, reply, db) => {
    if (!request.user || !request.orgId) {
      throw new UnauthorizedError('Authentication context missing');
    }

    // Admins always have access
    if (request.user.role === 'admin') {
      return;
    }

    // Query page permissions
    const query = `
      SELECT allowed_roles
      FROM page_permissions
      WHERE organization_id = $1 AND page_name = $2
    `;

    const result = await db.query(query, [request.orgId, pageName]);

    if (result.rows.length === 0) {
      // Default to admin-only if no permission defined
      throw new ForbiddenError('Access denied to this page');
    }

    const allowedRoles = result.rows[0].allowed_roles;

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions for this page');
    }
  };
};

/**
 * Helper function to extract Clerk user ID from token
 * This is a placeholder - in production, use Clerk's SDK to verify and decode
 */
function extractClerkUserId(token) {
  try {
    // In production, use Clerk's verifyToken() method
    // For development, you might decode the JWT payload
    // This is a simplified placeholder
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return payload.sub || payload.userId;
  } catch (error) {
    return null;
  }
}
