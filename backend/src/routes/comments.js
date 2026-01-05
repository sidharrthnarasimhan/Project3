import { authenticate } from '../middleware/auth.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Comments routes (for decisions, tasks, announcements, spaces)
 */
export default async function commentRoutes(fastify, options) {

  fastify.get('/orgs/:orgId/comments', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { entity_type, entity_id } = request.query;

    await verifyOrgAccess(request.clerkUserId, orgId);

    let query = 'SELECT * FROM comments WHERE organization_id = $1';
    const params = [orgId];
    let paramCount = 1;

    if (entity_type) {
      paramCount++;
      query += ` AND entity_type = $${paramCount}`;
      params.push(entity_type);
    }

    if (entity_id) {
      paramCount++;
      query += ` AND entity_id = $${paramCount}`;
      params.push(entity_id);
    }

    query += ' ORDER BY created_at ASC';

    const result = await db.query(query, params);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/comments', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { entity_type, entity_id, content } = request.body;

    if (!entity_type || !entity_id || !content) {
      throw new BadRequestError('entity_type, entity_id, and content are required');
    }

    const validTypes = ['decision', 'task', 'announcement', 'space'];
    if (!validTypes.includes(entity_type)) {
      throw new BadRequestError('Invalid entity_type');
    }

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO comments (organization_id, entity_type, entity_id, author_email, author_name, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orgId, entity_type, entity_id, user.email, user.full_name, content]
    );

    return successResponse(result.rows[0], 'Comment created successfully');
  });

  fastify.put('/orgs/:orgId/comments/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { content } = request.body;

    if (!content) {
      throw new BadRequestError('Content is required');
    }

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const existing = await db.query(
      'SELECT * FROM comments WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Comment not found');
    }

    const comment = existing.rows[0];

    if (comment.author_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the author or admins can update this comment');
    }

    const result = await db.query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND organization_id = $3
       RETURNING *`,
      [content, id, orgId]
    );

    return successResponse(result.rows[0], 'Comment updated successfully');
  });

  fastify.delete('/orgs/:orgId/comments/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const existing = await db.query(
      'SELECT * FROM comments WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Comment not found');
    }

    const comment = existing.rows[0];

    if (comment.author_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the author or admins can delete this comment');
    }

    await db.query(
      'DELETE FROM comments WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    return successResponse(null, 'Comment deleted successfully');
  });
}

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
