import { Contact, ContactStatus } from '../models/contact';
import { User } from '../models/user';
import { logger } from '../utils/logger';
import { MailService } from './mail';

export const ContactService = {
  async sendRequest(requesterId: string, recipientId: string) {
    try {
      if (requesterId === recipientId) {
        throw new Error('Cannot send request to yourself');
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) throw new Error('User not found');

      const existingContact = await Contact.findOne({
        $or: [
          { requester: requesterId, recipient: recipientId },
          { requester: recipientId, recipient: requesterId }
        ]
      });

      if (existingContact) {
        throw new Error(existingContact.status === ContactStatus.PENDING 
          ? 'Request already pending' 
          : 'Already connected');
      }

      const contact = new Contact({
        requester: requesterId,
        recipient: recipientId,
        status: ContactStatus.PENDING
      });

      await MailService.sendContactRequestEmail(
        recipient.email,
        (await User.findById(requesterId))?.name || 'A user'
      );

      await contact.save();
      return contact;
    } catch (error) {
      logger.error('Contact request failed:', error);
      throw error;
    }
  },

  async acceptRequest(requestId: string, userId: string) {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: requestId, recipient: userId, status: ContactStatus.PENDING },
        { status: ContactStatus.ACCEPTED },
        { new: true }
      );

      if (!contact) throw new Error('Invalid contact request');
      return contact;
    } catch (error) {
      logger.error('Accept request failed:', error);
      throw error;
    }
  },

  async getUserContacts(userId: string) {
    try {
      return await Contact.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: ContactStatus.ACCEPTED
      })
      .populate('requester', 'name email')
      .populate('recipient', 'name email');
    } catch (error) {
      logger.error('Get contacts failed:', error);
      throw error;
    }
  }
};