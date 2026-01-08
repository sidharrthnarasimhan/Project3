import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import db from './db/index.js';
import { userRoutes } from './routes/users.js';
import organizationRoutes from './routes/organizations.js';
import { invitationRoutes } from './routes/invitations.js';
import decisionRoutes from './routes/decisions.js';
import taskRoutes from './routes/tasks.js';
import spaceRoutes from './routes/spaces.js';
import announcementRoutes from './routes/announcements.js';
import commentRoutes from './routes/comments.js';
import {
  leaveRequestRoutes,
  holidayRoutes,
  timeEntryRoutes,
  billingToolRoutes,
  milestoneRoutes,
} from './routes/all-entities.js';
import healthRoutes from './routes/health.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

// CORS configuration
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

// Register database as a decorator
fastify.decorate('db', db);

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    name: 'Startup OS API',
    version: '1.0.0',
    documentation: '/docs',
  };
});

// Register routes
fastify.register(healthRoutes); // Health check routes (no prefix)
fastify.register(userRoutes, { prefix: '/api' });
fastify.register(organizationRoutes, { prefix: '/api' });
fastify.register(invitationRoutes, { prefix: '/api' });
fastify.register(decisionRoutes, { prefix: '/api' });
fastify.register(taskRoutes, { prefix: '/api' });
fastify.register(spaceRoutes, { prefix: '/api' });
fastify.register(announcementRoutes, { prefix: '/api' });
fastify.register(commentRoutes, { prefix: '/api' });
fastify.register(leaveRequestRoutes, { prefix: '/api' });
fastify.register(holidayRoutes, { prefix: '/api' });
fastify.register(timeEntryRoutes, { prefix: '/api' });
fastify.register(billingToolRoutes, { prefix: '/api' });
fastify.register(milestoneRoutes, { prefix: '/api' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.status(statusCode).send({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
});

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: request.url,
    },
  });
});

// Graceful shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Received signal ${signal}, closing gracefully...`);
  await db.close();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    fastify.log.info(`Server listening on http://${host}:${port}`);
    fastify.log.info(`Health check available at http://${host}:${port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default fastify;
