import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export const AuthService = {
  async register(email: string, name: string, password: string) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = new User({ email, name, password: hashedPassword });
      await user.save();

      return this.generateToken(user);
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');

      return this.generateToken(user);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  },

  generateToken(user: any) {
    return {
      token: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' }),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  }
};