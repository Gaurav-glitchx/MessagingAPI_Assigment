import {Server, ServerRoute } from '@hapi/hapi';
import { register, login } from '../controllers/auth';
import { loginSchema, registerSchema } from '../utils/validator';

const authRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: register,
    options: {
      auth: false,
      validate: {
        payload: registerSchema,
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: login,
    options: {
      auth: false,
      validate: {
        payload: loginSchema,
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  }
];

export const configureAuthRoutes = (server: Server) => {
    server.route(authRoutes);
};