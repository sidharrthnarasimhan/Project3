import pg from 'pg';
const { Pool } = pg;

export default async function healthRoutes(fastify) {
  // Basic health check
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
  });

  // Database health check
  fastify.get('/api/health/database', async (request, reply) => {
    const startTime = Date.now();

    try {
      // Test database connection
      const result = await fastify.db.query('SELECT NOW() as current_time, version() as db_version');
      const responseTime = Date.now() - startTime;

      // Get connection pool stats
      const poolStats = {
        total: fastify.db.totalCount,
        idle: fastify.db.idleCount,
        waiting: fastify.db.waitingCount
      };

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        database: {
          connected: true,
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version.split(' ')[0], // PostgreSQL version
          poolStats
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      reply.code(503);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        database: {
          connected: false,
          error: error.message
        }
      };
    }
  });

  // Detailed system health with all dependencies
  fastify.get('/api/health/detailed', async (request, reply) => {
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    // Database check
    try {
      const dbStart = Date.now();
      await fastify.db.query('SELECT 1');
      checks.checks.database = {
        status: 'up',
        responseTime: `${Date.now() - dbStart}ms`
      };
    } catch (error) {
      checks.status = 'unhealthy';
      checks.checks.database = {
        status: 'down',
        error: error.message
      };
    }

    // Clerk Auth check
    try {
      const clerkKey = process.env.CLERK_SECRET_KEY;
      checks.checks.clerk = {
        status: clerkKey ? 'configured' : 'not_configured',
        hasSecretKey: !!clerkKey
      };
    } catch (error) {
      checks.checks.clerk = {
        status: 'error',
        error: error.message
      };
    }

    // SendGrid check
    try {
      const sendgridKey = process.env.SENDGRID_API_KEY;
      checks.checks.sendgrid = {
        status: sendgridKey ? 'configured' : 'not_configured',
        hasApiKey: !!sendgridKey
      };
    } catch (error) {
      checks.checks.sendgrid = {
        status: 'error',
        error: error.message
      };
    }

    // Environment check
    checks.checks.environment = {
      status: 'ok',
      nodeEnv: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
      }
    };

    // CORS check
    checks.checks.cors = {
      status: 'ok',
      frontendUrl: process.env.FRONTEND_URL || 'not_configured'
    };

    return checks;
  });

  // Readiness check (for load balancers)
  fastify.get('/api/health/ready', async (request, reply) => {
    try {
      // Check if app can handle requests
      await fastify.db.query('SELECT 1');

      return {
        status: 'ready',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  });

  // Liveness check (for orchestrators)
  fastify.get('/api/health/live', async (request, reply) => {
    return {
      status: 'alive',
      timestamp: new Date().toISOString()
    };
  });
}
