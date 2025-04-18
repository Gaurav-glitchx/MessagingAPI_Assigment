// config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB: process.env.MONGO_DB,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};