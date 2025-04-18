import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

if (!env.EMAIL_USER || !env.EMAIL_PASS) {
  logger.error('Email credentials missing!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) {
    logger.error('SMTP Connection Error:', error);
  } else {
    logger.info('Connected to SMTP server');
  }
});

export const MailService = {
  async sendContactRequestEmail(to: string, fromName: string) {
    try {
      await transporter.sendMail({
        from: `"Messaging App" <${env.EMAIL_USER}>`,
        to,
        subject: 'New Contact Request',
        html: `<p>${fromName} wants to connect with you!</p>`
      });
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error('Email failed:', error);
      throw error;
    }
  }
};