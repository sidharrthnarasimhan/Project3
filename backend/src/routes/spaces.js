import { authenticate } from '../middleware/auth.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Spaces routes (Confluence-like documentation)
 * All routes are org-scoped: /orgs/:orgId/spaces
 */
export default async function spaceRoutes(fastify, options) {

  /**
   * GET /orgs/:orgId/spaces - List all accessible spaces
   */
  fastify.get('/orgs/:orgId/spaces', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get spaces user can access
    // - Public spaces
    // - Spaces owned by user
    // - Spaces where user is in allowed_users
    // - All spaces if admin
    const result = await db.query(
      `SELECT * FROM spaces
       WHERE organization_id = $1
       AND (
         is_public = true
         OR owner_email = $2
         OR $2 = ANY(allowed_users)
         OR $3 = 'admin'
       )
       ORDER BY updated_at DESC`,
      [orgId, user.email, user.role]
    );

    return successResponse(result.rows);
  });

  /**
   * GET /orgs/:orgId/spaces/:id - Get single space
   */
  fastify.get('/orgs/:orgId/spaces/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `SELECT * FROM spaces
       WHERE id = $1 AND organization_id = $2`,
      [id, orgId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Space not found');
    }

    const space = result.rows[0];

    // Check access
    const hasAccess =
      space.is_public ||
      space.owner_email === user.email ||
      (space.allowed_users && space.allowed_users.includes(user.email)) ||
      user.role === 'admin';

    if (!hasAccess) {
      throw new ForbiddenError('Access denied to this space');
    }

    return successResponse(space);
  });

  /**
   * POST /orgs/:orgId/spaces - Create space
   */
  fastify.post('/orgs/:orgId/spaces', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const {
      title,
      description,
      content,
      is_public = false,
      allowed_users = [],
    } = request.body;

    if (!title || !content) {
      throw new BadRequestError('Title and content are required');
    }

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO spaces (
         organization_id, title, description, content, owner_email, owner_name,
         is_public, allowed_users
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [orgId, title, description, content, user.email, user.full_name, is_public, allowed_users]
    );

    return successResponse(result.rows[0], 'Space created successfully');
  });

  /**
   * PUT /orgs/:orgId/spaces/:id - Update space
   */
  fastify.put('/orgs/:orgId/spaces/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { title, description, content, is_public, allowed_users } = request.body;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get existing space
    const existing = await db.query(
      'SELECT * FROM spaces WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Space not found');
    }

    const space = existing.rows[0];

    // Only owner or admin can update
    if (space.owner_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the owner or admins can update this space');
    }

    // Update space
    const result = await db.query(
      `UPDATE spaces
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           content = COALESCE($3, content),
           is_public = COALESCE($4, is_public),
           allowed_users = COALESCE($5, allowed_users),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND organization_id = $7
       RETURNING *`,
      [title, description, content, is_public, allowed_users, id, orgId]
    );

    return successResponse(result.rows[0], 'Space updated successfully');
  });

  /**
   * DELETE /orgs/:orgId/spaces/:id - Delete space
   */
  fastify.delete('/orgs/:orgId/spaces/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get existing space
    const existing = await db.query(
      'SELECT * FROM spaces WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Space not found');
    }

    const space = existing.rows[0];

    // Only owner or admin can delete
    if (space.owner_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the owner or admins can delete this space');
    }

    await db.query(
      'DELETE FROM spaces WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    return successResponse(null, 'Space deleted successfully');
  });

  /**
   * PUT /orgs/:orgId/spaces/:id/access - Update space access control
   */
  fastify.put('/orgs/:orgId/spaces/:id/access', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { is_public, allowed_users } = request.body;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get existing space
    const existing = await db.query(
      'SELECT * FROM spaces WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Space not found');
    }

    const space = existing.rows[0];

    // Only owner or admin can update access
    if (space.owner_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the owner or admins can update space access');
    }

    const result = await db.query(
      `UPDATE spaces
       SET is_public = COALESCE($1, is_public),
           allowed_users = COALESCE($2, allowed_users),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND organization_id = $4
       RETURNING *`,
      [is_public, allowed_users, id, orgId]
    );

    return successResponse(result.rows[0], 'Space access updated successfully');
  });
}

/**
 * Helper: Verify user has access to organization
 */
async function verifyOrgAccess(clerkUserId, orgId) {
  const result = await db.query(
    `SELECT u.id, u.email, u.full_name, m.role
     FROM users u
     JOIN memberships m ON u.id = m.user_id
     WHERE u.clerk_user_id = $1 AND m.organization_id = $2`,
    [clerkUserId, orgId]
  );

  if (result.rows.length === 0) {
    throw new ForbiddenError('Access denied to this organization');
  }

  return result.rows[0];
}
