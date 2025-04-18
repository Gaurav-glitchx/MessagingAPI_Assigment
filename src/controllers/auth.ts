import { Request, ResponseToolkit } from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { loginSchema, registerSchema } from '../utils/validator';

export const register = async (request: Request, h: ResponseToolkit) => {
  try {
    const { error } = registerSchema.validate(request.payload);
    if (error) return h.response({ message: error.details[0].message }).code(400);

    const { email, name, password } = request.payload as any;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return h.response({ message: 'Email already in use' }).code(400);
    }

    const user = new User({ email, name, password });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return h.response({
      user: { id: user._id, email: user.email, name: user.name },
      token
    }).code(201);
  } catch (error) {
    return h.response({ message: 'Registration failed' }).code(500);
  }
};

export const login = async (request: Request, h: ResponseToolkit) => {
  try {
    const { error } = loginSchema.validate(request.payload);
    if (error) return h.response({ message: error.details[0].message }).code(400);

    const { email, password } = request.payload as any;
    
    const user = await User.findOne({ email });
    if (!user) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return h.response({
      user: { id: user._id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    return h.response({ message: 'Login failed' }).code(500);
  }
};