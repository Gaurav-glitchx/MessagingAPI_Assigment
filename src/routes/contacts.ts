import Joi from 'joi';
import { ServerRoute,Server } from '@hapi/hapi';
import { 
  sendContactRequest, 
  acceptContactRequest, 
  getContacts 
} from '../controllers/contacts';
import { contactRequestSchema } from '../utils/validator';

const contactRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/contacts/request',
    handler: sendContactRequest,
    options: {
      validate: {
        payload: contactRequestSchema,
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/contacts/accept',
    handler: acceptContactRequest,
    options: {
      validate: {
        payload: Joi.object({
          requestId: Joi.string().required()
        }),
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/contacts',
    handler: getContacts
  }
];

export const configureContactRoutes = (server: Server) => {
    server.route(contactRoutes);
}