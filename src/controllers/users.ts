import { Request, ResponseToolkit } from '@hapi/hapi';
import { User } from '../models/user';

export const getCurrentUser = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.auth.credentials.userId;

    const user = await User.findById(userId)
      .select('-password -__v') 
      .lean();

    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }

    return h.response({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return h.response({ message: 'Failed to fetch user profile' }).code(500);
  }
};