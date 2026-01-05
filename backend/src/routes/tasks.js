import { authenticate } from '../middleware/auth.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Tasks routes
 * All routes are org-scoped: /orgs/:orgId/tasks
 */
export default async function taskRoutes(fastify, options) {

  /**
   * GET /orgs/:orgId/tasks - List all tasks
   */
  fastify.get('/orgs/:orgId/tasks', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { status, priority, category, assignee, sortBy = '-created_at' } = request.query;

    await verifyOrgAccess(request.clerkUserId, orgId);

    // Build query
    let query = 'SELECT * FROM tasks WHERE organization_id = $1';
    const params = [orgId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND priority = $${paramCount}`;
      params.push(priority);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (assignee) {
      paramCount++;
      query += ` AND assignee_email = $${paramCount}`;
      params.push(assignee);
    }

    // Handle sorting
    const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
    const sortOrder = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await db.query(query, params);

    return successResponse(result.rows);
  });

  /**
   * GET /orgs/:orgId/tasks/:id - Get single task
   */
  fastify.get('/orgs/:orgId/tasks/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Task not found');
    }

    return successResponse(result.rows[0]);
  });

  /**
   * POST /orgs/:orgId/tasks - Create task
   */
  fastify.post('/orgs/:orgId/tasks', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const {
      title,
      description,
      status = 'todo',
      priority,
      category,
      assignee_email,
      due_date,
      related_decision_id,
    } = request.body;

    if (!title) {
      throw new BadRequestError('Title is required');
    }

    await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO tasks (
         organization_id, title, description, status, priority, category,
         assignee_email, due_date, related_decision_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [orgId, title, description, status, priority, category, assignee_email, due_date, related_decision_id]
    );

    return successResponse(result.rows[0], 'Task created successfully');
  });

  /**
   * PUT /orgs/:orgId/tasks/:id - Update task
   */
  fastify.put('/orgs/:orgId/tasks/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;
    const {
      title,
      description,
      status,
      priority,
      category,
      assignee_email,
      due_date,
      related_decision_id,
    } = request.body;

    await verifyOrgAccess(request.clerkUserId, orgId);

    // Check task exists
    const existing = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (existing.rows.length === 0) {
      throw new NotFoundError('Task not found');
    }

    // Update task
    const result = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           category = COALESCE($5, category),
           assignee_email = COALESCE($6, assignee_email),
           due_date = COALESCE($7, due_date),
           related_decision_id = COALESCE($8, related_decision_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND organization_id = $10
       RETURNING *`,
      [title, description, status, priority, category, assignee_email, due_date, related_decision_id, id, orgId]
    );

    return successResponse(result.rows[0], 'Task updated successfully');
  });

  /**
   * DELETE /orgs/:orgId/tasks/:id - Delete task
   */
  fastify.delete('/orgs/:orgId/tasks/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId, id } = request.params;

    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Only admins and managers can delete tasks
    if (!['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only admins and managers can delete tasks');
    }

    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND organization_id = $2',
      [id, orgId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Task not found');
    }

    return successResponse(null, 'Task deleted successfully');
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
