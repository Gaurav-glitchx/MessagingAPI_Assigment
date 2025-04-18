import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const contactRequestSchema = Joi.object({
  recipientId: Joi.string().required()
});

export const messageSchema = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().required()
});