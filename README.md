# MessagingAPI_Assigment
# Secure Messaging API

A secure API-based chat backend built with Node.js, Hapi, and MongoDB, featuring authentication, contact management, and messaging capabilities.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features
- JWT-based authentication
- Contact request system
- Secure messaging with rate limiting
- Email notifications
- Paginated message history
- Input validation
- Error handling

## Tech Stack
**Server:** Node.js, Hapi, TypeScript  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**Email:** Nodemailer  
**Logging:** Winston  
**Rate Limiting:** Hapi rate limit plugin

## Environment Variables
Create `.env` file in root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/messaging_api
JWT_SECRET=your_strong_secret_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
