import { authenticate } from '../middleware/auth.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import db from '../db/index.js';

/**
 * Combined routes for Leave Requests, Holidays, Time Entries, Billing Tools, and Milestones
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

// ===== LEAVE REQUESTS =====
export async function leaveRequestRoutes(fastify, options) {
  fastify.get('/orgs/:orgId/leave-requests', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    await verifyOrgAccess(request.clerkUserId, orgId);
    const result = await db.query('SELECT * FROM leave_requests WHERE organization_id = $1 ORDER BY created_at DESC', [orgId]);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/leave-requests', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { type, start_date, end_date, reason } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO leave_requests (organization_id, requester_email, requester_name, type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
      [orgId, user.email, user.full_name, type, start_date, end_date, reason]
    );

    return successResponse(result.rows[0], 'Leave request created successfully');
  });

  fastify.put('/orgs/:orgId/leave-requests/:id/review', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { status } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (!['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only admins and managers can review leave requests');
    }

    const result = await db.query(
      `UPDATE leave_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND organization_id = $4 RETURNING *`,
      [status, user.email, id, orgId]
    );

    return successResponse(result.rows[0], 'Leave request reviewed successfully');
  });
}

// ===== HOLIDAYS =====
export async function holidayRoutes(fastify, options) {
  fastify.get('/orgs/:orgId/holidays', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    await verifyOrgAccess(request.clerkUserId, orgId);
    const result = await db.query('SELECT * FROM holidays WHERE organization_id = $1 ORDER BY date ASC', [orgId]);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/holidays', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { name, date, type } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (!['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only admins and managers can create holidays');
    }

    const result = await db.query(
      `INSERT INTO holidays (organization_id, name, date, type, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [orgId, name, date, type, user.email]
    );

    return successResponse(result.rows[0], 'Holiday created successfully');
  });

  fastify.delete('/orgs/:orgId/holidays/:id', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (user.role !== 'admin') {
      throw new ForbiddenError('Only admins can delete holidays');
    }

    await db.query('DELETE FROM holidays WHERE id = $1 AND organization_id = $2', [id, orgId]);
    return successResponse(null, 'Holiday deleted successfully');
  });
}

// ===== TIME ENTRIES =====
export async function timeEntryRoutes(fastify, options) {
  fastify.get('/orgs/:orgId/time-entries', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    // Users can see their own, admins/managers can see all
    let query = 'SELECT * FROM time_entries WHERE organization_id = $1';
    const params = [orgId];

    if (!['admin', 'manager'].includes(user.role)) {
      query += ' AND user_email = $2';
      params.push(user.email);
    }

    query += ' ORDER BY start_time DESC';
    const result = await db.query(query, params);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/time-entries', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { start_time, end_time, duration_ms } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO time_entries (organization_id, user_email, user_name, start_time, end_time, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [orgId, user.email, user.full_name, start_time, end_time, duration_ms]
    );

    return successResponse(result.rows[0], 'Time entry created successfully');
  });
}

// ===== BILLING TOOLS =====
export async function billingToolRoutes(fastify, options) {
  fastify.get('/orgs/:orgId/billing-tools', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (user.role !== 'admin') {
      throw new ForbiddenError('Only admins can access billing tools');
    }

    const result = await db.query('SELECT * FROM billing_tools WHERE organization_id = $1 ORDER BY created_at DESC', [orgId]);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/billing-tools', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { tool_name, plan, cost_per_month, expiry_date, contact_person, contact_email, status, notes } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (user.role !== 'admin') {
      throw new ForbiddenError('Only admins can create billing tools');
    }

    const result = await db.query(
      `INSERT INTO billing_tools (organization_id, tool_name, plan, cost_per_month, expiry_date, contact_person, contact_email, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [orgId, tool_name, plan, cost_per_month, expiry_date, contact_person, contact_email, status, notes]
    );

    return successResponse(result.rows[0], 'Billing tool created successfully');
  });

  fastify.put('/orgs/:orgId/billing-tools/:id', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { tool_name, plan, cost_per_month, expiry_date, contact_person, contact_email, status, notes } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (user.role !== 'admin') {
      throw new ForbiddenError('Only admins can update billing tools');
    }

    const result = await db.query(
      `UPDATE billing_tools SET
       tool_name = COALESCE($1, tool_name),
       plan = COALESCE($2, plan),
       cost_per_month = COALESCE($3, cost_per_month),
       expiry_date = COALESCE($4, expiry_date),
       contact_person = COALESCE($5, contact_person),
       contact_email = COALESCE($6, contact_email),
       status = COALESCE($7, status),
       notes = COALESCE($8, notes),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND organization_id = $10 RETURNING *`,
      [tool_name, plan, cost_per_month, expiry_date, contact_person, contact_email, status, notes, id, orgId]
    );

    return successResponse(result.rows[0], 'Billing tool updated successfully');
  });

  fastify.delete('/orgs/:orgId/billing-tools/:id', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (user.role !== 'admin') {
      throw new ForbiddenError('Only admins can delete billing tools');
    }

    await db.query('DELETE FROM billing_tools WHERE id = $1 AND organization_id = $2', [id, orgId]);
    return successResponse(null, 'Billing tool deleted successfully');
  });
}

// ===== MILESTONES =====
export async function milestoneRoutes(fastify, options) {
  fastify.get('/orgs/:orgId/milestones', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    await verifyOrgAccess(request.clerkUserId, orgId);
    const result = await db.query('SELECT * FROM milestones WHERE organization_id = $1 ORDER BY date ASC', [orgId]);
    return successResponse(result.rows);
  });

  fastify.post('/orgs/:orgId/milestones', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { title, description, milestone_type, status, date, category } = request.body;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `INSERT INTO milestones (organization_id, title, description, milestone_type, status, date, category, owner_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [orgId, title, description, milestone_type, status, date, category, user.email]
    );

    return successResponse(result.rows[0], 'Milestone created successfully');
  });

  fastify.put('/orgs/:orgId/milestones/:id', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const { title, description, milestone_type, status, date, category } = request.body;
    await verifyOrgAccess(request.clerkUserId, orgId);

    const result = await db.query(
      `UPDATE milestones SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       milestone_type = COALESCE($3, milestone_type),
       status = COALESCE($4, status),
       date = COALESCE($5, date),
       category = COALESCE($6, category),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND organization_id = $8 RETURNING *`,
      [title, description, milestone_type, status, date, category, id, orgId]
    );

    return successResponse(result.rows[0], 'Milestone updated successfully');
  });

  fastify.delete('/orgs/:orgId/milestones/:id', { preHandler: authenticate }, async (request, reply) => {
    const { orgId, id } = request.params;
    const user = await verifyOrgAccess(request.clerkUserId, orgId);

    if (!['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenError('Only admins and managers can delete milestones');
    }

    await db.query('DELETE FROM milestones WHERE id = $1 AND organization_id = $2', [id, orgId]);
    return successResponse(null, 'Milestone deleted successfully');
  });
}
