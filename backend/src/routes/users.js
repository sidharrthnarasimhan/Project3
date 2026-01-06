/**
 * User Routes
 * Handles user registration and profile management
 */

import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export async function userRoutes(fastify, options) {
  /**
   * POST /api/users/sync
   * Register or update user from Clerk
   */
  fastify.post('/users/sync', { preHandler: authenticate }, async (request, reply) => {
    const { clerk_id, email, full_name, avatar_url } = request.body;
    const clerkUserId = request.clerkUserId;
    const db = fastify.db;

    fastify.log.info({
      clerk_id,
      clerkUserId,
      email,
      full_name
    }, 'User sync request');

    // Verify the clerk_id matches the authenticated user
    if (clerk_id !== clerkUserId) {
      fastify.log.error({ clerk_id, clerkUserId }, 'Clerk ID mismatch');
      return reply.code(403).send(errorResponse('Unauthorized', 'FORBIDDEN'));
    }

    try {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE clerk_user_id = $1',
        [clerk_id]
      );

      fastify.log.info({ existingUserCount: existingUser.rows.length }, 'Existing user check');

      if (existingUser.rows.length > 0) {
        // User exists - update their info
        const result = await db.query(
          `UPDATE users
           SET email = $1, full_name = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP
           WHERE clerk_user_id = $4
           RETURNING *`,
          [email, full_name, avatar_url, clerk_id]
        );

        fastify.log.info({ userId: result.rows[0].id }, 'User updated');
        return reply.send(successResponse(result.rows[0]));
      } else {
        // Create new user
        const result = await db.query(
          `INSERT INTO users (clerk_user_id, email, full_name, avatar_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [clerk_id, email, full_name, avatar_url]
        );

        fastify.log.info({ userId: result.rows[0].id, clerk_id }, 'User created');
        return reply.code(201).send(successResponse(result.rows[0]));
      }
    } catch (error) {
      fastify.log.error({ err: error, clerk_id, email }, 'Failed to sync user');
      return reply.code(500).send(errorResponse('Failed to sync user: ' + error.message));
    }
  });

  /**
   * GET /api/users/me
   * Get current user profile
   */
  fastify.get('/users/me', { preHandler: authenticate }, async (request, reply) => {
    const clerkUserId = request.clerkUserId;
    const db = fastify.db;

    try {
      const result = await db.query(
        'SELECT * FROM users WHERE clerk_user_id = $1',
        [clerkUserId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send(errorResponse('User not found', 'NOT_FOUND'));
      }

      return reply.send(successResponse(result.rows[0]));
    } catch (error) {
      fastify.log.error({ err: error }, 'Failed to get user');
      return reply.code(500).send(errorResponse('Failed to get user'));
    }
  });
}
