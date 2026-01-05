import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Verify Clerk JWT token
 */
export async function verifyClerkToken(token) {
  try {
    const verified = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return verified;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Get Clerk user by ID
 */
export async function getClerkUser(userId) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error) {
    throw new Error('User not found');
  }
}

/**
 * Sync Clerk user to our database
 * Called when user first logs in or when user data changes
 */
export async function syncClerkUser(clerkUserId, db) {
  try {
    const clerkUser = await getClerkUser(clerkUserId);

    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email;
    const avatarUrl = clerkUser.imageUrl;

    // Upsert user in database
    const query = `
      INSERT INTO users (clerk_user_id, email, full_name, avatar_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await db.query(query, [clerkUserId, email, fullName, avatarUrl]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to sync user: ${error.message}`);
  }
}

/**
 * Get user's organizations from Clerk
 */
export async function getUserOrganizations(clerkUserId) {
  try {
    const orgMemberships = await clerkClient.users.getOrganizationMembershipList({
      userId: clerkUserId,
    });

    return orgMemberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    }));
  } catch (error) {
    throw new Error('Failed to fetch user organizations');
  }
}

/**
 * Create webhook handler for Clerk events
 * Use this to sync user/org changes from Clerk to your database
 */
export function createClerkWebhookHandler(db) {
  return async (request, reply) => {
    const event = request.body;

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await syncClerkUser(event.data.id, db);
        break;

      case 'organization.created':
        // Sync organization to database
        await syncOrganization(event.data, db);
        break;

      case 'organizationMembership.created':
        // Sync membership to database
        await syncMembership(event.data, db);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  };
}

async function syncOrganization(clerkOrg, db) {
  const query = `
    INSERT INTO organizations (id, name, slug, logo_url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      logo_url = EXCLUDED.logo_url,
      updated_at = CURRENT_TIMESTAMP
  `;

  await db.query(query, [
    clerkOrg.id,
    clerkOrg.name,
    clerkOrg.slug,
    clerkOrg.imageUrl,
  ]);
}

async function syncMembership(clerkMembership, db) {
  // First ensure user exists
  await syncClerkUser(clerkMembership.userId, db);

  const query = `
    INSERT INTO memberships (organization_id, user_id, role)
    SELECT $1, u.id, $3
    FROM users u
    WHERE u.clerk_user_id = $2
    ON CONFLICT (organization_id, user_id)
    DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = CURRENT_TIMESTAMP
  `;

  await db.query(query, [
    clerkMembership.organization.id,
    clerkMembership.userId,
    clerkMembership.role,
  ]);
}
