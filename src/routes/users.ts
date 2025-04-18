import { ServerRoute,Server } from '@hapi/hapi';
import { getCurrentUser } from '../controllers/users';

const userRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/users/me',
    handler: getCurrentUser,
    options: {
      auth: 'default'
    }
  }
];

export const configureUserRoutes = (server: Server) => {
    server.route(userRoutes);
}