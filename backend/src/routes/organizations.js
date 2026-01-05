import { authenticate, requireRole } from '../middleware/auth.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import { getUserOrganizations } from '../db/queries.js';
import db from '../db/index.js';

/**
 * Organization routes
 */
export default async function organizationRoutes(fastify, options) {

  /**
   * GET /orgs - Get all organizations for current user
   */
  fastify.get('/orgs', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { clerkUserId } = request;

    // Get user from database
    const userQuery = await db.query(
      'SELECT id FROM users WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (userQuery.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const userId = userQuery.rows[0].id;

    // Get user's organizations
    const organizations = await getUserOrganizations(db, userId);

    return successResponse(organizations);
  });

  /**
   * GET /orgs/:orgId - Get organization details
   */
  fastify.get('/orgs/:orgId', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { clerkUserId } = request;

    // Verify user has access to this org
    const membershipQuery = await db.query(
      `SELECT m.role, o.id, o.name, o.slug, o.logo_url, o.created_at, o.updated_at
       FROM organizations o
       JOIN memberships m ON o.id = m.organization_id
       JOIN users u ON m.user_id = u.id
       WHERE o.id = $1 AND u.clerk_user_id = $2`,
      [orgId, clerkUserId]
    );

    if (membershipQuery.rows.length === 0) {
      throw new NotFoundError('Organization not found or access denied');
    }

    const org = membershipQuery.rows[0];

    // Get member count
    const memberCountQuery = await db.query(
      'SELECT COUNT(*) as member_count FROM memberships WHERE organization_id = $1',
      [orgId]
    );

    return successResponse({
      ...org,
      memberCount: parseInt(memberCountQuery.rows[0].member_count),
    });
  });

  /**
   * POST /orgs - Create new organization
   */
  fastify.post('/orgs', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { name, slug } = request.body;
    const { clerkUserId } = request;

    if (!name || !slug) {
      throw new BadRequestError('Name and slug are required');
    }

    // Get user
    const userQuery = await db.query(
      'SELECT id FROM users WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (userQuery.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const userId = userQuery.rows[0].id;

    // Create organization and membership in a transaction
    const result = await db.transaction(async (client) => {
      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations (name, slug, logo_url)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, slug, request.body.logoUrl || null]
      );

      const newOrg = orgResult.rows[0];

      // Add creator as admin member
      await client.query(
        `INSERT INTO memberships (organization_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [newOrg.id, userId]
      );

      // Set up default page permissions
      const defaultPages = [
        { page: 'Home', roles: ['admin', 'manager', 'member', 'guest'] },
        { page: 'Decisions', roles: ['admin', 'manager', 'member'] },
        { page: 'Tasks', roles: ['admin', 'manager', 'member'] },
        { page: 'Announcements', roles: ['admin', 'manager', 'member', 'guest'] },
        { page: 'People', roles: ['admin', 'manager'] },
        { page: 'Calendar', roles: ['admin', 'manager', 'member', 'guest'] },
        { page: 'Settings', roles: ['admin', 'manager', 'member', 'guest'] },
        { page: 'Billing', roles: ['admin'] },
        { page: 'Product', roles: ['admin', 'manager'] },
        { page: 'Spaces', roles: ['admin', 'manager', 'member', 'guest'] },
      ];

      for (const { page, roles } of defaultPages) {
        await client.query(
          `INSERT INTO page_permissions (organization_id, page_name, allowed_roles)
           VALUES ($1, $2, $3)`,
          [newOrg.id, page, roles]
        );
      }

      // Create default company settings
      await client.query(
        `INSERT INTO company_settings (organization_id, company_name)
         VALUES ($1, $2)`,
        [newOrg.id, name]
      );

      return newOrg;
    });

    return successResponse(result, 'Organization created successfully');
  });

  /**
   * PUT /orgs/:orgId - Update organization
   */
  fastify.put('/orgs/:orgId', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { name, slug, logoUrl } = request.body;
    const { clerkUserId } = request;

    // Verify user is admin of this org
    const membershipQuery = await db.query(
      `SELECT m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.clerk_user_id = $2`,
      [orgId, clerkUserId]
    );

    if (membershipQuery.rows.length === 0) {
      throw new NotFoundError('Organization not found or access denied');
    }

    if (membershipQuery.rows[0].role !== 'admin') {
      throw new BadRequestError('Only admins can update organization');
    }

    // Update organization
    const result = await db.query(
      `UPDATE organizations
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           logo_url = COALESCE($3, logo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, slug, logoUrl, orgId]
    );

    return successResponse(result.rows[0], 'Organization updated successfully');
  });

  /**
   * GET /orgs/:orgId/members - Get organization members
   */
  fastify.get('/orgs/:orgId/members', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId } = request.params;
    const { clerkUserId } = request;

    // Verify user has access to this org
    const accessCheck = await db.query(
      `SELECT 1
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.clerk_user_id = $2`,
      [orgId, clerkUserId]
    );

    if (accessCheck.rows.length === 0) {
      throw new NotFoundError('Organization not found or access denied');
    }

    // Get members
    const membersQuery = await db.query(
      `SELECT
         u.id,
         u.email,
         u.full_name,
         u.avatar_url,
         m.role,
         m.created_at as joined_at
       FROM users u
       JOIN memberships m ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY m.created_at ASC`,
      [orgId]
    );

    return successResponse(membersQuery.rows);
  });

  /**
   * PUT /orgs/:orgId/members/:userId/role - Update member role
   */
  fastify.put('/orgs/:orgId/members/:userId/role', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { orgId, userId } = request.params;
    const { role } = request.body;
    const { clerkUserId } = request;

    const validRoles = ['admin', 'manager', 'member', 'guest'];
    if (!validRoles.includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    // Verify requester is admin
    const requesterQuery = await db.query(
      `SELECT m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.clerk_user_id = $2`,
      [orgId, clerkUserId]
    );

    if (requesterQuery.rows.length === 0 || requesterQuery.rows[0].role !== 'admin') {
      throw new BadRequestError('Only admins can change member roles');
    }

    // Update role
    const result = await db.query(
      `UPDATE memberships
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE organization_id = $2 AND user_id = $3
       RETURNING *`,
      [role, orgId, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Member not found');
    }

    return successResponse(result.rows[0], 'Member role updated successfully');
  });
}
