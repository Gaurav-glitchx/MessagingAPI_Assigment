import { Message } from '../models/message';
import { Contact } from '../models/contact';
import { logger } from '../utils/logger';

export const MessageService = {
  async sendMessage(senderId: string, receiverId: string, content: string) {
    try {
      // Verify contact relationship
      const contact = await Contact.findOne({
        $or: [
          { requester: senderId, recipient: receiverId, status: 'accepted' },
          { requester: receiverId, recipient: senderId, status: 'accepted' }
        ]
      });

      if (!contact) throw new Error('Not connected with this user');

      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content
      });

      await message.save();
      return message;
    } catch (error) {
      logger.error('Send message failed:', error);
      throw error;
    }
  },

  async getMessages(userId: string, contactId: string, page = 1, limit = 10) {
    try {
      const contact = await Contact.findById(contactId);
      if (!contact || 
          (contact.requester.toString() !== userId && 
           contact.recipient.toString() !== userId)) {
        throw new Error('Invalid contact');
      }

      const otherUserId = contact.requester.toString() === userId 
        ? contact.recipient 
        : contact.requester;

      const [messages, total] = await Promise.all([
        Message.find({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'name')
        .populate('receiver', 'name'),

        Message.countDocuments({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
      ]);

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get messages failed:', error);
      throw error;
    }
  }
};