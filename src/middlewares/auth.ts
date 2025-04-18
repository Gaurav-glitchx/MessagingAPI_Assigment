import { Request, ResponseToolkit, Lifecycle } from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

export const authMiddleware = {
  name: 'auth',
  register: (server: any) => {
    server.auth.scheme('jwt', () => ({
      authenticate: async (request: Request, h: ResponseToolkit) => {
        try {
          const authHeader = request.headers.authorization;
          if (!authHeader) {
            return h.response({ message: 'Authorization header missing' }).code(401).takeover();
          }

          const token = authHeader.split(' ')[1];
          if (!token) {
            return h.response({ message: 'Token missing' }).code(401).takeover();
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          const user = await User.findById(decoded.userId);

          if (!user) {
            return h.response({ message: 'User not found' }).code(401).takeover();
          }

          return h.authenticated({ credentials: { userId: user._id } });
        } catch (error) {
          return h.response({ message: 'Invalid token' }).code(401).takeover();
        }
      }
    }));

    server.auth.strategy('default', 'jwt');
    server.auth.default('default');
  }
};