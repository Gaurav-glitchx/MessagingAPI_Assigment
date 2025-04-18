import { Request, ResponseToolkit } from '@hapi/hapi';
import { Contact, ContactStatus } from '../models/contact';
import { User } from '../models/user';
import { contactRequestSchema } from '../utils/validator';
import mongoose from 'mongoose';
import { MailService } from '../services/mail';

interface PopulatedContact {
  _id: mongoose.Types.ObjectId;
  requester: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  recipient: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  status: ContactStatus;
  createdAt: Date;
}

export const sendContactRequest = async (request: Request, h: ResponseToolkit) => {
  try {
    const { error } = contactRequestSchema.validate(request.payload);
    if (error) return h.response({ message: error.details[0].message }).code(400);

    const userId = request.auth.credentials.userId;
    const { recipientId } = request.payload as { recipientId: string };

    // Check if user is trying to add themselves
    if (userId === recipientId) {
      return h.response({ message: 'Cannot send contact request to yourself' }).code(400);
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return h.response({ message: 'User not found' }).code(404);
    }

    // Check for existing contact request
    const existingContact = await Contact.findOne({
      $or: [
        { requester: userId, recipient: recipientId },
        { requester: recipientId, recipient: userId }
      ]
    });

    if (existingContact) {
      return h.response({ 
        message: existingContact.status === ContactStatus.PENDING
          ? 'Contact request already pending'
          : 'User is already in your contacts'
      }).code(400);
    }

    const newContact = new Contact({
      requester: userId,
      recipient: recipientId,
      status: ContactStatus.PENDING
    });
    await newContact.save();
    
    await MailService.sendContactRequestEmail(
      recipient.email,
      (await User.findById(userId))?.name || 'A user'
    );
    return h.response({ 
      message: 'Contact request sent',
      data: {
        id: newContact._id,
        status: newContact.status
      }
    }).code(201);
  } catch (error) {
    return h.response({ message: 'Failed to send contact request' }).code(500);
  }
};

export const acceptContactRequest = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.auth.credentials.userId;
    const { requestId } = request.payload as { requestId: string };

    const contact = await Contact.findOneAndUpdate(
      {
        _id: requestId,
        recipient: userId,
        status: ContactStatus.PENDING
      },
      { status: ContactStatus.ACCEPTED },
      { new: true }
    );

    if (!contact) {
      return h.response({ message: 'Contact request not found or already processed' }).code(404);
    }

    return h.response({ 
      message: 'Contact request accepted',
      data: {
        id: contact._id,
        status: contact.status
      }
    });
  } catch (error) {
    return h.response({ message: 'Failed to accept contact request' }).code(500);
  }
};

export const getContacts = async (request: Request, h: ResponseToolkit) => {
  try {
    const userId = request.auth.credentials.userId;

    const contacts = await Contact.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: ContactStatus.ACCEPTED
    })
    .populate<{ requester: { _id: mongoose.Types.ObjectId, name: string, email: string } }>('requester', 'name email')
    .populate<{ recipient: { _id: mongoose.Types.ObjectId, name: string, email: string } }>('recipient', 'name email')
    .lean() as unknown as PopulatedContact[];

    const formattedContacts = contacts.map(contact => {
      const isRequester = contact.requester._id.toString() === userId;
      const contactUser = isRequester ? contact.recipient : contact.requester;

      return {
        id: contact._id,
        user: {
          id: contactUser._id,
          name: contactUser.name,
          email: contactUser.email
        },
        status: contact.status,
        createdAt: contact.createdAt
      };
    });

    return h.response({ contacts: formattedContacts });
  } catch (error) {
    return h.response({ message: 'Failed to fetch contacts' }).code(500);
  }
};