import Joi from 'joi';
import { ServerRoute,Server } from '@hapi/hapi';
import { sendMessage, getMessages } from '../controllers/messages';
import { messageSchema } from '../utils/validator';

const messageRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/messages',
    handler: sendMessage,
    options: {
      validate: {
        payload: messageSchema,
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/messages/{contactId}',
    handler: getMessages,
    options: {
      validate: {
        params: Joi.object({
          contactId: Joi.string().required()
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10)
        })
      }
    }
  }
];

export const configureMessageRoutes = (server: Server) => {
    server.route(messageRoutes);
}