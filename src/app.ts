import Hapi from '@hapi/hapi';
import mongoose from 'mongoose';
import { authMiddleware } from './middlewares/auth';
// import rateLimitPlugin from './middlewares/rateLimit';
import { configureAuthRoutes } from './routes/auth';
import { configureContactRoutes } from './routes/contacts';
import { configureMessageRoutes } from './routes/messages';
import { configureUserRoutes } from './routes/users';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

export const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        credentials: true
      },
      validate: {
        failAction: async (request, h, err) => {
          if (process.env.NODE_ENV === 'production') {
            logger.error('Validation error:', err?.message);
            throw err;
          } else {
            logger.error('Validation error:', err?.message);
            return h.response({ error: 'Invalid request payload' }).code(400).takeover();
          }
        }
      }
    }
  });

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Could not connect to MongoDB:', error);
    process.exit(1);
  }

  // Register plugins and middlewares
  // await server.register([authMiddleware,rateLimitPlugin]);
  await server.register([authMiddleware]);

  // Configure routes
  configureAuthRoutes(server);
  configureUserRoutes(server);
  configureContactRoutes(server);
  configureMessageRoutes(server);

  // Swagger documentation (optional)
  if (process.env.NODE_ENV !== 'production') {
    await server.register([
      require('@hapi/vision'),
      require('@hapi/inert'),
      {
        plugin: require('hapi-swagger'),
        options: {
          info: {
            title: 'Messaging API',
            version: '1.0'
          }
        }
      }
    ]);
  }

  return server;
};