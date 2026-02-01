# EmailService - Complete Email Management Platform

A powerful, full-featured email management platform built with Next.js 15, TypeScript, and MongoDB. Includes user authentication, SMTP configuration, email sending, and advanced features like OTP verification and password recovery.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Features Documentation](#features-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

### Core Authentication
- **User Registration** with email and password
- **User Login** with JWT token-based sessions
- **Password Hashing** using bcryptjs (12 rounds)
- **JWT Token Management** for secure session handling
- **Persistent Sessions** via localStorage

### Email Management
- **SMTP Configuration** with encrypted credential storage
- **Email Sending** via custom API with authentication
- **Email Logging** for tracking and auditing
- **Template Support** with HTML and text formats
- **Attachments Support** for emails with files

### OTP Verification System
- **4-Digit OTP Generation** (1000-9999)
- **Email OTP Delivery** using the platform's email service
- **OTP Verification** with attempt tracking
- **Automatic Expiration** after 10 minutes
- **Rate Limiting** with 3 attempts maximum per OTP
- **Resend Cooldown** with 60-second delay

### Forgot Password Flow
- **Email-Based Recovery** using OTP verification
- **Secure Password Reset** with new password confirmation
- **Account Verification** before password change
- **Multi-Step Process** for enhanced security

### Dashboard & Admin
- **User Dashboard** with quick stats
- **SMTP Configuration Panel** for email settings
- **Email Logs Viewer** with filtering capabilities
- **API Key Management** for programmatic access
- **Session Management** and logout

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - Latest React features
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - NoSQL database
- **Nodemailer** - Email delivery
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **crypto-js** - Credential encryption

### DevOps & Deployment
- **Vercel** - Deployment platform
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager

---

## Project Structure

```
emailservice/
├── app/
│   ├── api/
│   │   ├── login/
│   │   │   └── route.ts              # Login endpoint
│   │   ├── signup/
│   │   │   └── route.ts              # User registration
│   │   ├── logout/
│   │   │   └── route.ts              # Logout endpoint
│   │   ├── send-email/
│   │   │   └── route.ts              # Email sending with API key
│   │   ├── otp/
│   │   │   ├── generate/
│   │   │   │   └── route.ts          # OTP generation & sending
│   │   │   └── verify/
│   │   │       └── route.ts          # OTP verification
│   │   ├── reset-password/
│   │   │   └── route.ts              # Password reset endpoint
│   │   └── [other routes]
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   ├── login/
│   │   └── page.tsx                  # Login page with forgot password link
│   ├── signup/
│   │   └── page.tsx                  # Registration page
│   ├── verify-email/
│   │   └── page.tsx                  # Email verification with OTP
│   ├── forgot-password/
│   │   └── page.tsx                  # Password recovery flow
│   ├── dashboard/
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── smtp/
│   │   │   └── page.tsx              # SMTP configuration
│   │   ├── emails/
│   │   │   └── page.tsx              # Email logs viewer
│   │   └── api-keys/
│   │       └── page.tsx              # API key management
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── auth/                         # Auth components
│   ├── dashboard/                    # Dashboard components
│   └── ...other components
├── contexts/
│   └── auth-context.tsx              # Authentication context
├── hooks/
│   ├── use-mobile.ts                 # Mobile detection hook
│   ├── use-toast.ts                  # Toast notifications
│   └── ...other hooks
├── lib/
│   ├── mongodb.ts                    # MongoDB connection
│   ├── jwt.ts                        # JWT utilities
│   ├── encryption.ts                 # Encryption utilities
│   ├── otp-utils.ts                  # OTP helpers
│   └── utils.ts                      # General utilities
├── public/
│   └── logo.png                      # Application logo (used in emails)
├── .env.local                        # Environment variables (local)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── README.md                         # This file
```

---

## Installation

### Prerequisites
- Node.js 18+ or higher
- npm 9+ or yarn
- MongoDB instance (local or cloud)
- SMTP server access (for email sending)

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/PrathameshK004/EmailService.git

# Navigate to project directory
cd EmailService

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

---

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/emailservice
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emailservice

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Encryption Key for SMTP credentials (16 characters)
ENCRYPTION_KEY=1234567890123456

# Email API Key (used for OTP and internal emails)
SEND_EMAIL_API_KEY=your_api_key_here

# Application URL (for email links and logo)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Node Environment
NODE_ENV=development
```

### Getting the Required Keys

#### JWT_SECRET
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### ENCRYPTION_KEY
Must be exactly 16 characters for AES-128 encryption:
```bash
node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"
```

#### SEND_EMAIL_API_KEY
Create an API key in the application dashboard or use a custom key. This is used for internal OTP and notification emails.

---

## Configuration

### Step 1: Setup MongoDB

**Using MongoDB Atlas (Recommended for Production):**
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with credentials
3. Add your IP address to the whitelist
4. Copy the connection string
5. Add to `.env.local` as `MONGODB_URI`

**Using Local MongoDB:**
```bash
# Start MongoDB service
mongod

# Connection string in .env.local:
# MONGODB_URI=mongodb://localhost:27017/emailservice
```

### Step 2: Configure SMTP

1. Log in to your dashboard at `http://localhost:3000/dashboard`
2. Navigate to **Settings** → **SMTP Configuration**
3. Enter your SMTP server details:
   - **Host**: smtp.example.com
   - **Port**: 587 or 465
   - **Secure**: true (for port 465) or false (for port 587)
   - **Username**: your-email@example.com
   - **Password**: your-app-password

SMTP credentials are encrypted in the database using AES-128 encryption.

### Step 3: Add Logo

Place your application logo in the `public/` folder as `logo.png`:
- Recommended size: 80x80 pixels
- Format: PNG with transparency
- This logo appears in OTP verification emails

---

## API Endpoints

### Authentication Endpoints

#### Sign Up
```http
POST /api/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {jwt_token}

Response:
{
  "message": "Logged out successfully"
}
```

### Email Endpoints

#### Send Email
```http
POST /api/send-email
Content-Type: application/json
Authorization: Bearer {api_key_or_jwt_token}

{
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>Email Content</h1>",
  "text": "Email text fallback",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64_encoded_content",
      "contentType": "application/pdf"
    }
  ]
}

Response:
{
  "message": "Email sent successfully",
  "messageId": "message_id_from_smtp"
}
```

### OTP Endpoints

#### Generate OTP
```http
POST /api/otp/generate
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "signup" | "forgot-password"
}

Response:
{
  "message": "OTP sent to user@example.com",
  "expiresIn": 600
}
```

#### Verify OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234",
  "type": "signup" | "forgot-password"
}

Response:
{
  "message": "OTP verified successfully"
}
```

### Password Recovery Endpoints

#### Reset Password
```http
POST /api/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "NewSecurePassword123!"
}

Response:
{
  "message": "Password reset successfully"
}
```

---

## Features Documentation

### OTP Verification System

#### How It Works

1. **OTP Generation**
   - User requests OTP (signup or forgot password)
   - 4-digit random number generated (1000-9999)
   - Stored in database with 10-minute expiration
   - Professional HTML email sent via SMTP

2. **Email Delivery**
   - Email sent using the internal send-email API
   - Uses your configured SMTP credentials
   - Professional template with logo from public folder
   - Includes user information and security notices

3. **OTP Verification**
   - User enters OTP from email
   - Matched against database record
   - Attempt counter incremented
   - Auto-locked after 3 failed attempts
   - 60-second cooldown before resend

4. **Security Features**
   - 10-minute expiration time
   - 3-attempt limit per OTP
   - 60-second cooldown between resends
   - Auto-delete after successful verification
   - Failed attempts logged in database

#### Email Template

The OTP email includes:
- Professional header with logo
- User's name in greeting
- Clear OTP display (larger font)
- Expiration time notification
- Security disclaimer
- Footer with branding

### Forgot Password Flow

#### Step-by-Step Process

1. **Request Recovery**
   - User clicks "Forgot password?" on login page
   - Enters email address
   - System verifies email exists in database

2. **OTP Generation**
   - 4-digit OTP generated
   - Professional email sent to user
   - 10-minute validity window

3. **OTP Verification**
   - User enters OTP from email
   - System validates OTP
   - Confirms email ownership

4. **Password Reset**
   - User enters new password
   - Password confirmation required
   - Bcrypt hashing applied (12 rounds)
   - Database updated with new password

5. **Success Redirect**
   - User redirected to login
   - Can now login with new password
   - OTP deleted from database

#### Security Measures

- Email verification before password change
- Password confirmation to prevent typos
- Bcrypt hashing with 12 rounds
- Failed attempts are tracked
- OTP expires after 10 minutes
- Max 3 attempts allowed per OTP

---

## Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique, lowercase),
  password: String (bcrypt hashed, required),
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### otp_attempts
```javascript
{
  _id: ObjectId,
  email: String (required),
  type: String (enum: ["signup", "forgot-password"]),
  otp: String (4 digits),
  expiresAt: Date,
  attempts: Number (0-3),
  createdAt: Date,
  lastAttemptAt: Date
}
```

#### smtp_credentials
```javascript
{
  _id: ObjectId,
  userId: String (required),
  host: String (required),
  port: Number (required),
  secure: Boolean (required),
  user: String (encrypted),
  pass: String (encrypted),
  configuredAt: Date,
  updatedAt: Date
}
```

#### email_logs
```javascript
{
  _id: ObjectId,
  userId: String (required),
  from: String,
  to: String,
  subject: String,
  hasAttachments: Boolean,
  messageId: String,
  sentAt: Date,
  status: String (enum: ["sent", "failed", "pending"])
}
```

#### api_keys
```javascript
{
  _id: ObjectId,
  userId: String (required),
  name: String,
  keyHash: String (SHA-256 hashed),
  createdAt: Date,
  lastUsedAt: Date,
  expiresAt: Date,
  isActive: Boolean
}
```

---

## Security

### Password Security
- **Hashing**: bcryptjs with 12 rounds
- **Storage**: Hashed passwords only, never plaintext
- **Validation**: Minimum 6 characters required
- **Confirmation**: Required for password changes

### Credential Encryption
- **Method**: AES-128 encryption
- **Storage**: Encrypted SMTP credentials in database
- **Keys**: Encryption key from environment variables
- **Decryption**: On-demand only when needed

### Authentication
- **JWT Tokens**: Signed with secret key
- **Expiration**: Configurable token lifetime
- **Storage**: localStorage with XSS considerations
- **Validation**: Token verified on each protected request

### API Security
- **API Keys**: SHA-256 hashed in database
- **Rate Limiting**: Available via reverse proxy (Nginx, Cloudflare)
- **CORS**: Configurable for production
- **Input Validation**: All endpoints validate input

### Email Security
- **TLS/SSL**: Recommended for SMTP connections
- **Credentials**: Never logged or exposed
- **Templates**: HTML sanitized before sending
- **Logging**: Sensitive data not stored in logs

### Data Protection
- **MongoDB**: Use authentication and IP whitelisting
- **Backups**: Regular automated backups recommended
- **Compliance**: Consider GDPR for EU users
- **Deletion**: User data can be deleted on request

---

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

The development server includes:
- Hot module reloading
- Source maps for debugging
- Development console logs

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Testing Authentication

1. **Sign Up**
   ```
   http://localhost:3000/signup
   - Username: testuser
   - Email: test@example.com
   - Password: TestPassword123!
   ```

2. **Verify Email**
   - Check console or email for OTP
   - Enter OTP to verify email
   - Redirected to login

3. **Login**
   ```
   http://localhost:3000/login
   - Email: test@example.com
   - Password: TestPassword123!
   ```

4. **Test Forgot Password**
   - On login page, click "Forgot password?"
   - Enter registered email
   - Receive OTP via email
   - Enter OTP to verify
   - Set new password
   - Login with new password

### Environment Variables for Development

```env
# Use local MongoDB for development
MONGODB_URI=mongodb://localhost:27017/emailservice-dev

# Generate a temporary JWT secret
JWT_SECRET=dev_secret_key_change_for_production

# Standard encryption key
ENCRYPTION_KEY=1234567890123456

# Test API key
SEND_EMAIL_API_KEY=test_api_key_12345

# Local development URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development mode
NODE_ENV=development
```

---

## Deployment

### Deploying to Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Link to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import the GitHub repository
   - Select the project

3. **Set Environment Variables**
   - In Vercel Dashboard: Settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     MONGODB_URI
     JWT_SECRET
     ENCRYPTION_KEY
     SEND_EMAIL_API_KEY
     NEXT_PUBLIC_APP_URL
     NODE_ENV=production
     ```

4. **Deploy**
   - Vercel automatically builds and deploys
   - Visit your production URL

### Deploying to Other Platforms

**Using Docker:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Deploy with Docker:**
```bash
docker build -t emailservice .
docker run -p 3000:3000 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  emailservice
```

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change `ENCRYPTION_KEY` to a strong random value
- [ ] Use MongoDB Atlas for database
- [ ] Enable MongoDB IP whitelisting
- [ ] Configure SMTP server (Gmail, SendGrid, AWS SES)
- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS/SSL
- [ ] Setup automated backups
- [ ] Configure email rate limiting
- [ ] Setup monitoring and logging
- [ ] Enable CORS for specific domains
- [ ] Test forgot password flow end-to-end
- [ ] Test OTP verification
- [ ] Load test email sending

---

## Troubleshooting

### Common Issues

#### OTP Not Received
1. Check SMTP credentials in dashboard
2. Verify email domain whitelisting
3. Check spam/junk folder
4. Look for errors in server logs
5. Ensure API key is set correctly

#### Login Issues
1. Verify email is registered
2. Check password is correct
3. Clear browser cache and cookies
4. Check JWT_SECRET hasn't changed
5. Verify MongoDB connection

#### Email Sending Fails
1. Configure SMTP in dashboard
2. Test SMTP connection
3. Check encryption key matches
4. Verify API key for programmatic access
5. Check email attachments size limit

#### Database Connection Error
1. Verify MongoDB is running (local) or accessible (cloud)
2. Check connection string format
3. Verify credentials
4. Check IP whitelisting (MongoDB Atlas)
5. Ensure database exists

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/EmailService.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Describe changes clearly
   - Link related issues
   - Wait for review and feedback

### Code Style Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Support

For issues, questions, or suggestions:

1. **Open an Issue** - GitHub Issues for bug reports
2. **Discussions** - GitHub Discussions for questions
3. **Email** - Contact: support@emailservice.com
4. **Documentation** - Check README and code comments

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- User authentication (signup/login)
- Email sending with SMTP
- OTP verification system
- Forgot password flow
- Dashboard with SMTP configuration
- Email logging and tracking
- API key management

### Planned Features
- Email templates library
- Scheduled email sending
- Email analytics and insights
- Team collaboration features
- Webhook support
- Advanced user management
- Two-factor authentication (2FA)

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Nodemailer](https://nodemailer.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by the EmailService Team**

For more information, visit [GitHub Repository](https://github.com/PrathameshK004/EmailService)
