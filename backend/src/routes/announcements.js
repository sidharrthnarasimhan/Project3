import { authenticate } from '../middleware/auth.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Announcements routes
 */
export default async function announcementRoutes(fastify, options) {

  fastify.get('/orgs/:orgId/announcements', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { priority, sortBy = '-created_at' } = request.query;

    await verifyOrgAccess(request.clerkUserId, orgId);

    let query = 'SELECT * FROM announcements WHERE organization_id = $1';
    const params = [orgId];

    if (priority) {
      query += ' AND priority = $2';
      params.push(priority);
    }

    const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await db.query(query, params);
    return successResponse(result.rows);
  });

  fastify.get('/orgs/:orgId/announcements/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      'SELECT * FROM announcements WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Announcement not found');
    }

    return successResponse(result.rows[0]);
  });

  fastify.post('/orgs/:orgId/announcements', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { title, content, priority = 'medium' } = request.body;

    if (!title || !content) {
      throw new BadRequestError('Title and content are required');
    }

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Only admin and manager can create announcements
    if (!['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only admins and managers can create announcements');
    }

    const result = await db.query(
      `INSERT INTO announcements (organization_id, title, content, priority, author_email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orgId, title, content, priority, user.email]
    );

    return successResponse(result.rows[0], 'Announcement created successfully');
  });

  fastify.put('/orgs/:orgId/announcements/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { title, content, priority } = request.body;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const existing = await db.query(
      'SELECT * FROM announcements WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Announcement not found');
    }

    const announcement = existing.rows[0];

    if (announcement.author_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the author or admins can update this announcement');
    }

    const result = await db.query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           priority = COALESCE($3, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND organization_id = $5
       RETURNING *`,
      [title, content, priority, id, orgId]
    );

    return successResponse(result.rows[0], 'Announcement updated successfully');
  });

  fastify.delete('/orgs/:orgId/announcements/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const existing = await db.query(
      'SELECT * FROM announcements WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Announcement not found');
    }

    const announcement = existing.rows[0];

    if (announcement.author_email !== user.email && user.role !== 'admin') {
      throw new ForbiddenError('Only the author or admins can delete this announcement');
    }

    await db.query(
      'DELETE FROM announcements WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    return successResponse(null, 'Announcement deleted successfully');
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
