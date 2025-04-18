import { Request, ResponseToolkit } from '@hapi/hapi';
import mongoose from 'mongoose';
import { Message } from '../models/message';
import { Contact, ContactStatus } from '../models/contact';
import { User } from '../models/user';
import { messageSchema } from '../utils/validator';

// Interface for populated user fields
interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

// Interface for populated message document
interface PopulatedMessage {
  _id: mongoose.Types.ObjectId;
  content: string;
  sender: IUser;
  receiver: IUser;
  createdAt: Date;
}

export const sendMessage = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.auth.credentials.userId as string;
    const { receiverId, content } = request.payload as { receiverId: string; content: string };

    // Verify contact relationship
    const contact = await Contact.findOne({
      $or: [
        { requester: userId, recipient: receiverId, status: ContactStatus.ACCEPTED },
        { requester: receiverId, recipient: userId, status: ContactStatus.ACCEPTED }
      ]
    });

    if (!contact) {
      return h.response({ message: 'You can only message accepted contacts' }).code(403);
    }

    const message = new Message({
      sender: new mongoose.Types.ObjectId(userId),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content
    });

    await message.save();

    return h.response({ 
      message: 'Message sent',
      data: {
        id: message._id,
        content: message.content,
        createdAt: message.createdAt
      }
    }).code(201);
  } catch (error) {
    console.error('Error sending message:', error); // Log the error
    return h.response({ 
      message: 'Failed to send message', // Optionally include error message in response
    }).code(500);
  }
};


export const getMessages = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.auth.credentials.userId as string;
    const { contactId } = request.params as { contactId: string };
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 10;

    // Validate pagination parameters
    if (isNaN(page)) return h.response({ message: 'Invalid page number' }).code(400);
    if (isNaN(limit)) return h.response({ message: 'Invalid limit value' }).code(400);

    // Verify contact relationship
    const contact = await Contact.findById(contactId)
      .populate<{ requester: IUser }>('requester', 'name email')
      .populate<{ recipient: IUser }>('recipient', 'name email');

    if (!contact){
      return h.response({ message: 'Invalid contact' }).code(403);
    }

    const otherUserId = contact.requester._id.toString() === userId 
      ? contact.recipient._id 
      : contact.requester._id;

    // Get messages with pagination
    const [messages, totalMessages] = await Promise.all([
      Message.find({
        $or: [
          { 
            sender: new mongoose.Types.ObjectId(userId),
            receiver: new mongoose.Types.ObjectId(otherUserId) 
          },
          { 
            sender: new mongoose.Types.ObjectId(otherUserId),
            receiver: new mongoose.Types.ObjectId(userId) 
          }
        ]
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ sender: IUser }>('sender', 'name')
      .populate<{ receiver: IUser }>('receiver', 'name')
      .lean(),
    
      Message.countDocuments({
        $or: [
          { 
            sender: new mongoose.Types.ObjectId(userId),
            receiver: new mongoose.Types.ObjectId(otherUserId) 
          },
          { 
            sender: new mongoose.Types.ObjectId(otherUserId),
            receiver: new mongoose.Types.ObjectId(userId) 
          }
        ]
      })
    ]);

    return h.response({
      messages: messages.map(msg => ({
        id: msg._id,
        content: msg.content,
        sender: {
          id: msg.sender._id,
          name: msg.sender.name
        },
        receiver: {
          id: msg.receiver._id,
          name: msg.receiver.name
        },
        createdAt: msg.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    return h.response({ message: 'Failed to fetch messages' }).code(500);
  }
};