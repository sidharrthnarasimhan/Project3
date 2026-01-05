import { authenticate } from '../middleware/auth.js';
import { canModifyResource } from '../middleware/permissions.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Decisions routes
 * All routes are org-scoped: /orgs/:orgId/decisions
 */
export default async function decisionRoutes(fastify, options) {

  /**
   * GET /orgs/:orgId/decisions - List all decisions
   */
  fastify.get('/orgs/:orgId/decisions', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { status, category, sortBy = '-created_at' } = request.query;

    // Verify user access to org
    await verifyOrgAccess(request.clerkUserId, orgId);

    // Build query
    let query = `
      SELECT * FROM decisions
      WHERE organization_id = $1
    `;
    const params = [orgId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    // Handle sorting
    const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await db.query(query, params);

    return successResponse(result.rows);
  });

  /**
   * GET /orgs/:orgId/decisions/:id - Get single decision
   */
  fastify.get('/orgs/:orgId/decisions/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      'SELECT * FROM decisions WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Decision not found');
    }

    return successResponse(result.rows[0]);
  });

  /**
   * POST /orgs/:orgId/decisions - Create decision
   */
  fastify.post('/orgs/:orgId/decisions', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { title, description, status, category, outcome } = request.body;

    if (!title || !status) {
      throw new BadRequestError('Title and status are required');
    }

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Members can only create in discussion status
    if (user.role === 'member' && status !== 'discussion') {
      throw new ForbiddenError('Members can only create decisions in discussion status');
    }

    const result = await db.query(
      `INSERT INTO decisions (organization_id, title, description, status, category, owner_email, outcome)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [orgId, title, description, status, category, user.email, outcome]
    );

    return successResponse(result.rows[0], 'Decision created successfully');
  });

  /**
   * PUT /orgs/:orgId/decisions/:id - Update decision
   */
  fastify.put('/orgs/:orgId/decisions/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { title, description, status, category, outcome } = request.body;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get existing decision
    const existing = await db.query(
      'SELECT * FROM decisions WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Decision not found');
    }

    const decision = existing.rows[0];

    // Only owner or admin/manager can update
    if (decision.owner_email !== user.email && !['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only the owner or admins/managers can update this decision');
    }

    // Update decision
    const result = await db.query(
      `UPDATE decisions
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           category = COALESCE($4, category),
           outcome = COALESCE($5, outcome),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND organization_id = $7
       RETURNING *`,
      [title, description, status, category, outcome, id, orgId]
    );

    return successResponse(result.rows[0], 'Decision updated successfully');
  });

  /**
   * DELETE /orgs/:orgId/decisions/:id - Delete decision
   */
  fastify.delete('/orgs/:orgId/decisions/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Get existing decision
    const existing = await db.query(
      'SELECT * FROM decisions WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Decision not found');
    }

    const decision = existing.rows[0];

    // Only owner or admin can delete
    if (decision.owner_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the owner or admins can delete this decision');
    }

    await db.query(
      'DELETE FROM decisions WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    return successResponse(null, 'Decision deleted successfully');
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
