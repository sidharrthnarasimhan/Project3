/**
 * Common database queries
 * Reusable query functions for common operations
 */

/**
 * Get user by Clerk ID with organization membership
 */
export async function getUserByClerkId(db, clerkUserId, organizationId = null) {
  const query = organizationId
    ? `
      SELECT
        u.id,
        u.clerk_user_id,
        u.email,
        u.full_name,
        u.avatar_url,
        m.role,
        m.organization_id
      FROM users u
      LEFT JOIN memberships m ON u.id = m.user_id AND m.organization_id = $2
      WHERE u.clerk_user_id = $1
    `
    : `
      SELECT
        u.id,
        u.clerk_user_id,
        u.email,
        u.full_name,
        u.avatar_url
      FROM users u
      WHERE u.clerk_user_id = $1
    `;

  const params = organizationId ? [clerkUserId, organizationId] : [clerkUserId];
  const result = await db.query(query, params);
  return result.rows[0];
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(db, userId) {
  const query = `
    SELECT
      o.id,
      o.name,
      o.slug,
      o.logo_url,
      m.role,
      m.created_at as joined_at
    FROM organizations o
    JOIN memberships m ON o.id = m.organization_id
    WHERE m.user_id = $1
    ORDER BY m.created_at DESC
  `;

  const result = await db.query(query, [userId]);
  return result.rows;
}

/**
 * Check if user has access to organization
 */
export async function checkOrgAccess(db, userId, organizationId) {
  const query = `
    SELECT role
    FROM memberships
    WHERE user_id = $1 AND organization_id = $2
  `;

  const result = await db.query(query, [userId, organizationId]);
  return result.rows[0];
}

/**
 * Check if user has page access
 */
export async function checkPageAccess(db, organizationId, pageName, userRole) {
  // Admins always have access
  if (userRole === 'admin') {
    return true;
  }

  const query = `
    SELECT allowed_roles
    FROM page_permissions
    WHERE organization_id = $1 AND page_name = $2
  `;

  const result = await db.query(query, [organizationId, pageName]);

  if (result.rows.length === 0) {
    // No permissions defined, default to admin-only
    return false;
  }

  const allowedRoles = result.rows[0].allowed_roles;
  return allowedRoles.includes(userRole);
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(db, organizationId) {
  const query = `
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.avatar_url,
      m.role,
      m.created_at as joined_at
    FROM users u
    JOIN memberships m ON u.id = m.user_id
    WHERE m.organization_id = $1
    ORDER BY m.created_at ASC
  `;

  const result = await db.query(query, [organizationId]);
  return result.rows;
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(page, limit, totalCount) {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasNext: page * limit < totalCount,
    hasPrev: page > 1,
  };
}

/**
 * Build WHERE clause for filters
 */
export function buildFilterClause(filters, baseParams = []) {
  const whereClauses = [];
  const params = [...baseParams];
  let paramCount = baseParams.length;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      paramCount++;
      whereClauses.push(`${key} = $${paramCount}`);
      params.push(value);
    }
  });

  return {
    whereClause: whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : '',
    params,
  };
}

/**
 * Upsert user from Clerk data
 */
export async function upsertUser(db, clerkUserId, email, fullName, avatarUrl) {
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
}
