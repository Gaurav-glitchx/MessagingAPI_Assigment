import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const MailService = {
  async sendContactRequestEmail(to: string, fromUserName: string) {
    try {
      await transporter.sendMail({
        from: `"Messaging App" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'New Contact Request',
        html: `<p>You received a contact request from ${fromUserName}</p>`
      });
    } catch (error) {
      logger.error('Send email failed:', error);
      throw error;
    }
  }
};