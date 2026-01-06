/**
 * Invitation Routes
 * Handles organization invitations and member joining
 */

import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export async function invitationRoutes(fastify, options) {
  const db = fastify.db;

  /**
   * POST /orgs/:orgId/invitations
   * Invite a user to the organization by email
   */
  fastify.post('/orgs/:orgId/invitations', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const { email, role = 'member' } = request.body;
    const clerkUserId = request.clerkUserId;

    if (!email) {
      throw new BadRequestError('Email is required');
    }

    const validRoles = ['admin', 'manager', 'member', 'guest'];
    if (!validRoles.includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    // Verify requester is admin or manager
    const requesterQuery = await db.query(
      `SELECT m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.clerk_user_id = $2`,
      [orgId, clerkUserId]
    );

    if (requesterQuery.rows.length === 0) {
      throw new NotFoundError('Organization not found or access denied');
    }

    const requesterRole = requesterQuery.rows[0].role;
    if (requesterRole !== 'admin' && requesterRole !== 'manager') {
      throw new BadRequestError('Only admins and managers can invite members');
    }

    // Check if invitation already exists
    const existingInvite = await db.query(
      `SELECT * FROM invitations
       WHERE organization_id = $1 AND email = $2 AND status = 'pending'`,
      [orgId, email.toLowerCase()]
    );

    if (existingInvite.rows.length > 0) {
      throw new BadRequestError('Invitation already sent to this email');
    }

    // Check if user is already a member
    const existingMember = await db.query(
      `SELECT m.* FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.email = $2`,
      [orgId, email.toLowerCase()]
    );

    if (existingMember.rows.length > 0) {
      throw new BadRequestError('User is already a member of this organization');
    }

    // Create invitation
    const result = await db.query(
      `INSERT INTO invitations (organization_id, email, role, invited_by)
       VALUES ($1, $2, $3, (SELECT id FROM users WHERE clerk_user_id = $4))
       RETURNING *`,
      [orgId, email.toLowerCase(), role, clerkUserId]
    );

    fastify.log.info({ email, orgId, role }, 'Invitation created');

    return reply.code(201).send(successResponse(result.rows[0], 'Invitation sent'));
  });

  /**
   * GET /orgs/:orgId/invitations
   * Get all pending invitations for an organization
   */
  fastify.get('/orgs/:orgId/invitations', { preHandler: authenticate }, async (request, reply) => {
    const { orgId } = request.params;
    const clerkUserId = request.clerkUserId;

    // Verify user is admin or manager
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

    const role = membershipQuery.rows[0].role;
    if (role !== 'admin' && role !== 'manager') {
      throw new BadRequestError('Only admins and managers can view invitations');
    }

    // Get invitations
    const result = await db.query(
      `SELECT i.*, u.full_name as invited_by_name, u.email as invited_by_email
       FROM invitations i
       LEFT JOIN users u ON i.invited_by = u.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [orgId]
    );

    return successResponse(result.rows);
  });

  /**
   * GET /invitations/pending
   * Get pending invitations for current user's email
   */
  fastify.get('/invitations/pending', { preHandler: authenticate }, async (request, reply) => {
    const clerkUserId = request.clerkUserId;

    // Get user email
    const userQuery = await db.query(
      'SELECT email FROM users WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (userQuery.rows.length === 0) {
      return successResponse([]);
    }

    const email = userQuery.rows[0].email;

    // Get pending invitations
    const result = await db.query(
      `SELECT i.*, o.name as organization_name, o.slug as organization_slug
       FROM invitations i
       JOIN organizations o ON i.organization_id = o.id
       WHERE i.email = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [email]
    );

    return successResponse(result.rows);
  });

  /**
   * POST /invitations/:invitationId/accept
   * Accept an invitation to join an organization
   */
  fastify.post('/invitations/:invitationId/accept', { preHandler: authenticate }, async (request, reply) => {
    const { invitationId } = request.params;
    const clerkUserId = request.clerkUserId;

    // Get user
    const userQuery = await db.query(
      'SELECT id, email FROM users WHERE clerk_user_id = $1',
      [clerkUserId]
    );

    if (userQuery.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const { id: userId, email } = userQuery.rows[0];

    // Get invitation
    const inviteQuery = await db.query(
      `SELECT * FROM invitations WHERE id = $1 AND email = $2 AND status = 'pending'`,
      [invitationId, email]
    );

    if (inviteQuery.rows.length === 0) {
      throw new NotFoundError('Invitation not found or already used');
    }

    const invitation = inviteQuery.rows[0];

    // Accept invitation in transaction
    const result = await db.transaction(async (client) => {
      // Create membership
      await client.query(
        `INSERT INTO memberships (organization_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [invitation.organization_id, userId, invitation.role]
      );

      // Mark invitation as accepted
      await client.query(
        `UPDATE invitations SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [invitationId]
      );

      // Get organization details
      const orgQuery = await client.query(
        'SELECT * FROM organizations WHERE id = $1',
        [invitation.organization_id]
      );

      return orgQuery.rows[0];
    });

    fastify.log.info({ userId, orgId: invitation.organization_id }, 'Invitation accepted');

    return successResponse(result, 'Successfully joined organization');
  });

  /**
   * DELETE /invitations/:invitationId
   * Cancel/delete an invitation
   */
  fastify.delete('/invitations/:invitationId', { preHandler: authenticate }, async (request, reply) => {
    const { invitationId } = request.params;
    const clerkUserId = request.clerkUserId;

    // Get invitation
    const inviteQuery = await db.query(
      'SELECT * FROM invitations WHERE id = $1',
      [invitationId]
    );

    if (inviteQuery.rows.length === 0) {
      throw new NotFoundError('Invitation not found');
    }

    const invitation = inviteQuery.rows[0];

    // Verify user is admin or manager of the organization
    const membershipQuery = await db.query(
      `SELECT m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.organization_id = $1 AND u.clerk_user_id = $2`,
      [invitation.organization_id, clerkUserId]
    );

    if (membershipQuery.rows.length === 0) {
      throw new NotFoundError('Organization not found or access denied');
    }

    const role = membershipQuery.rows[0].role;
    if (role !== 'admin' && role !== 'manager') {
      throw new BadRequestError('Only admins and managers can cancel invitations');
    }

    // Delete invitation
    await db.query('DELETE FROM invitations WHERE id = $1', [invitationId]);

    return successResponse(null, 'Invitation cancelled');
  });
}
