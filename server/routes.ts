import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertArtworkSchema,
  insertCommissionSchema,
  insertTutorialSchema,
  insertTutorialStepSchema,
  insertPasswordResetTokenSchema,
  insertMessageSchema
} from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail, sendEmail } from "./email";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { verifyFirebaseIdToken } from "./firebase-verify";
import rateLimit from "express-rate-limit";
import { fileTypeFromBuffer } from "file-type";

const BCRYPT_SALT_ROUNDS = 10;

// Rate limiters for endpoints that are otherwise unlimited guess/spam targets
// (brute-forcing a password, hammering the password-reset email sender, or
// spamming the contact-form email). Disabled during tests (VITEST) so the
// test suite isn't rate-limited against itself.
const skipInTests = () => !!process.env.VITEST;
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: "Too many login attempts. Please try again later." },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: "Too many accounts created from this location. Please try again later." },
});
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: "Too many password reset attempts. Please try again later." },
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: { message: "Too many messages sent. Please try again later." },
});

// Add auth middleware
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      user?: any;
    }
  }
}

// The auth_token cookie previously held the plain username with nothing
// tying it to the real login -- anyone could set auth_token=<any username>
// (usernames are public, e.g. on artist profiles) and be fully authenticated
// as that user, admin included. It's now HMAC-signed with a server secret so
// a token can only be produced by this server, never forged by a client.
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  console.warn(
    "Warning: SESSION_SECRET is not set. Generating a random secret for this " +
    "process -- all existing sessions will be invalidated on every restart. " +
    "Set SESSION_SECRET to a long random string in production."
  );
  return crypto.randomBytes(32).toString('hex');
})();
// 30 days, matching the auth_token cookie's maxAge below -- a token older
// than this is rejected even if its signature still checks out.
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  u: string; // username
  v: number; // user's sessionVersion at the time this token was issued
  t: number; // issued-at, ms since epoch
}

function signSessionToken(username: string, sessionVersion: number): string {
  const payload: SessionPayload = { u: username, v: sessionVersion, t: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('hex');
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('hex');
  let signatureBuffer: Buffer, expectedBuffer: Buffer;
  try {
    signatureBuffer = Buffer.from(signature, 'hex');
    expectedBuffer = Buffer.from(expectedSignature, 'hex');
  } catch {
    return null;
  }
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.u !== 'string' || typeof payload.v !== 'number' || typeof payload.t !== 'number') {
    return null;
  }
  if (Date.now() - payload.t > SESSION_MAX_AGE_MS) return null; // expired

  return payload;
}

// Simple token-based authentication middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from authorization header or cookie
  const authHeader = req.headers.authorization;
  const authToken = authHeader ? authHeader.replace('Bearer ', '') : null;

  // Check for token in both header and cookies for flexibility
  const token = authToken || req.cookies?.auth_token;

  req.isAuthenticated = () => {
    return !!req.user;
  };

  if (token) {
    try {
      const payload = verifySessionToken(token);
      if (payload) {
        const user = await storage.getUserByUsername(payload.u);

        // sessionVersion must match the user's *current* value -- a password
        // change bumps it, which immediately invalidates every token issued
        // before that change (see updateUserPassword in storage.ts).
        if (user && user.sessionVersion === payload.v) {
          // Don't expose password in req.user
          const { password, ...userWithoutPassword } = user;
          req.user = userWithoutPassword;
        }
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
  }

  next();
};

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work.");
}
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any // Type assertion to resolve LSP issue
}) : null;

// Configure multer to hold uploaded files in memory (not on local disk --
// Render's filesystem is ephemeral and gets wiped on every deploy, which
// is why file uploads used to disappear after a redeploy). The buffer gets
// streamed to Cloudinary in uploadImageBuffer below.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ALLOWED_IMAGE_TYPES = new Set(['jpg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif']);

async function uploadImageBuffer(buffer: Buffer): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Image upload is not configured');
  }

  // multer's fileFilter only checks the client-declared mimetype, which a
  // client can set to anything regardless of the file's real content. Sniff
  // the actual file signature here as a second, authoritative check before
  // anything gets uploaded.
  const detectedType = await fileTypeFromBuffer(buffer);
  if (!detectedType || !ALLOWED_IMAGE_TYPES.has(detectedType.ext)) {
    throw new Error('File does not appear to be a valid image');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'exposure-art' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Image upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function registerRoutes(app: Express, httpServer?: Server): Promise<Server> {
  const router = express.Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // User routes
  router.post('/users/register', registerLimiter, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);
      const newUser = await storage.createUser({ ...userData, password: hashedPassword });
      // Don't return password in response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  router.post('/users/login', loginLimiter, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set auth cookie with enhanced security and persistence
      res.cookie('auth_token', signSessionToken(username, user.sessionVersion), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
        sameSite: 'lax'
      });
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get current authenticated user
  router.get('/users/me', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      res.status(200).json(req.user);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Logout route
  router.post('/users/logout', (req: Request, res: Response) => {
    // Clear the auth cookie
    res.clearCookie('auth_token');
    res.status(200).json({ message: "Logout successful" });
  });
  
  // Password reset routes
  router.post('/users/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, still return success even if email not found
        return res.status(200).json({ 
          message: "If an account with this email exists, a password reset link has been sent" 
        });
      }
      
      // Create a reset token
      const resetToken = await storage.createPasswordResetToken(user.id);
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(email, resetToken.token);
      
      res.status(200).json({ 
        message: "If an account with this email exists, a password reset link has been sent",
        success: emailSent
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post('/users/reset-password', passwordResetLimiter, async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      console.log('Reset password request:', { token: token ? 'token-provided' : 'no-token', passwordProvided: !!newPassword });
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // Verify token is valid and not expired
      const resetToken = await storage.getPasswordResetTokenByToken(token);
      console.log('Reset token found:', !!resetToken);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      console.log('Reset token details:', { 
        tokenId: resetToken.id,
        userId: resetToken.userId,
        created: resetToken.createdAt,
        expires: resetToken.expiresAt,
        used: resetToken.used
      });
      
      // Update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
      const user = await storage.updateUserPassword(resetToken.userId, hashedPassword);
      console.log('User password updated:', !!user);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Mark the token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);
      
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get('/users/verify-reset-token/:token', async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      
      // Verify token is valid and not expired
      const resetToken = await storage.getPasswordResetTokenByToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      res.status(200).json({ message: "Token is valid", userId: resetToken.userId });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/users/firebase-auth', async (req: Request, res: Response) => {
    try {
      // The client used to send raw email/uid/displayName/photoURL, which the
      // server trusted outright -- anyone could POST any known email (e.g. the
      // hardcoded admin@exposure.art) and be signed in as that account, no
      // Firebase login required. The client now sends its Firebase ID token
      // instead, and the server verifies it against Google's public keys so
      // the identity actually comes from a real Firebase sign-in.
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "Firebase ID token is required" });
      }

      let verified;
      try {
        verified = await verifyFirebaseIdToken(idToken);
      } catch (err) {
        console.error("Firebase ID token verification failed:", err);
        return res.status(401).json({ message: "Invalid or expired sign-in token" });
      }

      const { uid: firebaseUid, email, emailVerified, name: displayName, picture: photoURL } = verified;

      if (!email || !emailVerified) {
        return res.status(401).json({ message: "A verified email is required to sign in" });
      }

      // Check if user exists by email
      let user = await storage.getUserByEmail(email);
      const isNewUser = !user;

      if (!user) {
        // User doesn't exist, create a new one
        const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
        user = await storage.createUser({
          username,
          password: '', // No password for social login
          email,
          fullName: displayName || username,
          bio: '',
          isArtist: false,
          profileImage: photoURL || '',
          firebaseUid
        });
      } else if (!user.firebaseUid) {
        // First time this existing (password-based) account signs in via
        // Firebase -- link it, matching the account by verified email.
        await storage.updateUserFirebaseInfo(user.id, { firebaseUid });
        user = { ...user, firebaseUid };
      } else if (user.firebaseUid !== firebaseUid) {
        // This email is already linked to a different Firebase identity --
        // don't silently sign the caller into it.
        return res.status(401).json({ message: "This email is already linked to a different account" });
      }

      // Set auth cookie, same as the regular login route
      res.cookie('auth_token', signSessionToken(user.username, user.sessionVersion), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
        sameSite: 'lax'
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.status(isNewUser ? 201 : 200).json(userWithoutPassword);
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/users/artists', async (req: Request, res: Response) => {
    try {
      const artists = await storage.getArtists();
      // Remove passwords from response
      const artistsWithoutPasswords = artists.map(artist => {
        const { password, ...artistWithoutPassword } = artist;
        return artistWithoutPassword;
      });
      
      res.status(200).json(artistsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/users/featured-artists', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const artists = await storage.getFeaturedArtists(limit);
      
      // Remove passwords from response
      const artistsWithoutPasswords = artists.map(artist => {
        const { password, ...artistWithoutPassword } = artist;
        return artistWithoutPassword;
      });
      
      res.status(200).json(artistsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/users', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      res.json(users.map(({ password, ...user }) => user));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow users to delete their own profile or admin users
      if (req.user.id !== id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Personalized recommendations for users
  router.get('/users/:id/recommendations', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Check if we need to generate new recommendations
      const generateNew = req.query.refresh === 'true';
      
      let recommendations;
      if (generateNew) {
        recommendations = await storage.generateRecommendationsForUser(userId);
      } else {
        // Get existing recommendations or generate new ones if none exist
        recommendations = await storage.getRecommendationsForUser(userId, limit);
        if (recommendations.length === 0) {
          recommendations = await storage.generateRecommendationsForUser(userId);
        }
      }
      
      // Fetch full artwork details for each recommendation
      const detailedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          const artwork = await storage.getArtwork(rec.artworkId);
          if (!artwork) return null;
          
          const artist = await storage.getUser(artwork.artistId);
          const category = await storage.getCategory(artwork.categoryId);
          
          return {
            ...rec,
            artwork: {
              ...artwork,
              artistName: artist ? artist.fullName : 'Unknown Artist',
              categoryName: category ? category.name : 'Uncategorized'
            }
          };
        })
      );
      
      res.json(detailedRecommendations.filter(r => r !== null));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // User preferences endpoints
  router.post('/users/:id/preferences', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (!req.user || req.user.id !== userId) {
        return res.status(403).json({ message: 'You can only update your own preferences' });
      }

      const preferences = req.body;
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Subscription management
  router.post('/users/:id/subscription', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (!req.user || (req.user.id !== userId && !req.user.isAdmin)) {
        return res.status(403).json({ message: 'You can only update your own subscription' });
      }

      const subscription = req.body;
      const updatedUser = await storage.updateUserSubscription(userId, subscription);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Messages
  router.get('/messages/conversations', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const conversations = await storage.getConversations(req.user.id);
      const sanitized = conversations.map(({ otherUser, ...rest }) => {
        const { password, ...otherUserWithoutPassword } = otherUser;
        return { otherUser: otherUserWithoutPassword, ...rest };
      });
      res.json(sanitized);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/messages/:otherUserId', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const otherUserId = parseInt(req.params.otherUserId);
      const conversation = await storage.getConversation(req.user.id, otherUserId);
      await storage.markConversationAsRead(req.user.id, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/messages', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Contact form
  router.post('/contact', contactLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      const contactEmail = process.env.CONTACT_EMAIL;
      if (!contactEmail) {
        console.error('Contact form error: CONTACT_EMAIL is not set');
        return res.status(500).json({ message: "Contact form isn't configured yet" });
      }

      const html = `
        <h1>New contact form message</h1>
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `;

      const emailSent = await sendEmail(contactEmail, `New message from ${name}`, html);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send message. Please try again." });
      }

      res.status(200).json({ message: "Message sent" });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User interaction tracking
  router.post('/interactions', async (req: Request, res: Response) => {
    try {
      const interaction = req.body;
      const newInteraction = await storage.createUserInteraction(interaction);
      res.status(201).json(newInteraction);
    } catch (error) {
      console.error('Error creating interaction:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Stripe payment intent for premium subscription
  router.post('/create-payment-intent', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }
      
      // Get amount from request or default to $10.00
      const { amount = 1000 } = req.body; 
      
      // Create a payment intent for the subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          subscription_type: 'premium',
          product: 'EXPOSurE.ART Premium Subscription'
        }
      });
      
      // Send client secret to the client
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Stripe payment intent for a specific artwork purchase
  router.post('/artworks/:id/create-payment-intent', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const artwork = await storage.getArtwork(Number(req.params.id));
      if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' });
      }
      if (!artwork.forSale) {
        return res.status(400).json({ message: 'This artwork is not for sale' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(artwork.price * 100), // Amount in cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          artworkId: String(artwork.id),
          artworkTitle: artwork.title
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: error.message || 'Failed to create payment intent' });
    }
  });

  // Category routes
  router.get('/categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Artwork routes
  router.get('/artworks', async (req: Request, res: Response) => {
    try {
      let artworks;
      
      if (req.query.artistId) {
        const artistId = parseInt(req.query.artistId as string);
        artworks = await storage.getArtworksByArtist(artistId);
      } else if (req.query.categoryId) {
        const categoryId = parseInt(req.query.categoryId as string);
        artworks = await storage.getArtworksByCategory(categoryId);
      } else {
        artworks = await storage.getArtworks();
      }
      
      res.status(200).json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/artworks/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const artworks = await storage.getFeaturedArtworks(limit);
      res.status(200).json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/artworks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      res.status(200).json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/artworks', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }
      
      const imageUrl = await uploadImageBuffer(req.file.buffer);
      const artworkData = insertArtworkSchema.parse({
        ...req.body,
        imageUrl,
        price: parseFloat(req.body.price),
        artistId: parseInt(req.body.artistId),
        categoryId: parseInt(req.body.categoryId),
        forSale: req.body.forSale === 'true',
        isOriginal: req.body.isOriginal === 'true',
        limitedEdition: req.body.limitedEdition === 'true',
        editionCount: req.body.editionCount ? parseInt(req.body.editionCount) : undefined
      });
      
      const newArtwork = await storage.createArtwork(artworkData);
      res.status(201).json(newArtwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        console.error('Error creating artwork:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
      }
    }
  });

  router.put('/artworks/:id', upload.single('image'), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);

      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      if (!req.user || (req.user.id !== artwork.artistId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "You can only edit your own artwork" });
      }

      let updateData: any = { ...req.body };
      
      // Handle numeric fields
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.artistId) updateData.artistId = parseInt(updateData.artistId);
      if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
      if (updateData.editionCount) updateData.editionCount = parseInt(updateData.editionCount);
      
      // Handle boolean fields
      if (updateData.forSale) updateData.forSale = updateData.forSale === 'true';
      if (updateData.isOriginal) updateData.isOriginal = updateData.isOriginal === 'true';
      if (updateData.limitedEdition) updateData.limitedEdition = updateData.limitedEdition === 'true';
      
      // Handle file upload if new image provided
      if (req.file) {
        updateData.imageUrl = await uploadImageBuffer(req.file.buffer);
      }

      const updatedArtwork = await storage.updateArtwork(id, updateData);
      res.status(200).json(updatedArtwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        console.error('Error updating artwork:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
      }
    }
  });

  router.delete('/artworks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);

      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      if (!req.user || (req.user.id !== artwork.artistId && !req.user.isAdmin)) {
        return res.status(403).json({ message: "You can only delete your own artwork" });
      }

      const deleted = await storage.deleteArtwork(id);
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete artwork" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Commission routes
  router.get('/commissions', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      let commissions;

      if (req.query.artistId) {
        const artistId = parseInt(req.query.artistId as string);
        if (req.user.id !== artistId && !req.user.isAdmin) {
          return res.status(403).json({ message: "You can only view your own commissions" });
        }
        commissions = await storage.getCommissionsByArtist(artistId);
      } else if (req.query.buyerId) {
        const buyerId = parseInt(req.query.buyerId as string);
        if (req.user.id !== buyerId && !req.user.isAdmin) {
          return res.status(403).json({ message: "You can only view your own commissions" });
        }
        commissions = await storage.getCommissionsByBuyer(buyerId);
      } else if (req.user.isAdmin) {
        commissions = await storage.getCommissions();
      } else {
        // No admin, no filter -- default to this user's own commissions
        // (as buyer or artist) instead of handing back everyone's.
        const [asArtist, asBuyer] = await Promise.all([
          storage.getCommissionsByArtist(req.user.id),
          storage.getCommissionsByBuyer(req.user.id),
        ]);
        commissions = [...asArtist, ...asBuyer];
      }

      res.status(200).json(commissions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/commissions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const commission = await storage.getCommission(id);

      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      const isParticipant = req.user && (req.user.id === commission.artistId || req.user.id === commission.buyerId);
      if (!isParticipant && !(req.user && req.user.isAdmin)) {
        return res.status(403).json({ message: "You don't have permission to view this commission" });
      }

      res.status(200).json(commission);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/commissions', async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const commissionData = insertCommissionSchema.parse({
        ...req.body,
        buyerId: req.user.id,
        artistId: parseInt(req.body.artistId),
        budget: req.body.budget ? parseFloat(req.body.budget) : undefined
      });
      
      const newCommission = await storage.createCommission(commissionData);
      res.status(201).json(newCommission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  router.patch('/commissions/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const commission = await storage.getCommission(id);

      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      const isParticipant = req.user && (req.user.id === commission.artistId || req.user.id === commission.buyerId);
      if (!isParticipant && !(req.user && req.user.isAdmin)) {
        return res.status(403).json({ message: "You don't have permission to update this commission" });
      }

      const updatedCommission = await storage.updateCommissionStatus(id, status);
      res.status(200).json(updatedCommission);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // TUTORIAL SYSTEM ROUTES
  
  // Get all tutorials
  router.get('/tutorials', async (req: Request, res: Response) => {
    try {
      const tutorials = await storage.getTutorials();
      return res.json(tutorials);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get tutorials by category
  router.get('/tutorials/category/:categoryId', async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      
      const tutorials = await storage.getTutorialsByCategory(categoryId);
      return res.json(tutorials);
    } catch (error) {
      console.error("Error fetching tutorials by category:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get a specific tutorial by ID
  router.get('/tutorials/:id', async (req: Request, res: Response) => {
    try {
      const tutorialId = parseInt(req.params.id);
      if (isNaN(tutorialId)) {
        return res.status(400).json({ error: "Invalid tutorial ID" });
      }
      
      const tutorial = await storage.getTutorial(tutorialId);
      if (!tutorial) {
        return res.status(404).json({ error: "Tutorial not found" });
      }
      
      // Increment view count when tutorial is accessed
      await storage.incrementTutorialViews(tutorialId);
      
      // Fetch tutorial steps
      const steps = await storage.getTutorialSteps(tutorialId);
      
      return res.json({ 
        ...tutorial,
        steps
      });
    } catch (error) {
      console.error("Error fetching tutorial:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Create a new tutorial (requires authentication)
  router.post('/tutorials', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check if the user is an artist
      if (!req.user.isArtist) {
        return res.status(403).json({ error: "Only artists can create tutorials" });
      }
      
      // Handle image upload if provided
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = await uploadImageBuffer(req.file.buffer);
      }
      
      // Validate request body
      const parsedBody = insertTutorialSchema.safeParse({
        ...req.body,
        imageUrl,
        authorId: req.user.id,
        published: req.body.published === 'true',
        durationMinutes: req.body.durationMinutes ? parseInt(req.body.durationMinutes) : null
      });
      
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error });
      }
      
      const tutorial = await storage.createTutorial(parsedBody.data);
      return res.status(201).json(tutorial);
    } catch (error) {
      console.error("Error creating tutorial:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });
  
  // Add a step to a tutorial (requires authentication)
  router.post('/tutorials/:id/steps', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const tutorialId = parseInt(req.params.id);
      if (isNaN(tutorialId)) {
        return res.status(400).json({ error: "Invalid tutorial ID" });
      }
      
      // Get the tutorial to verify ownership
      const tutorial = await storage.getTutorial(tutorialId);
      if (!tutorial) {
        return res.status(404).json({ error: "Tutorial not found" });
      }
      
      // Check if user is the author of the tutorial
      if (tutorial.authorId !== req.user.id) {
        return res.status(403).json({ error: "You can only add steps to your own tutorials" });
      }
      
      // Handle image upload if provided
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = await uploadImageBuffer(req.file.buffer);
      }
      
      // Validate request body
      const parsedBody = insertTutorialStepSchema.safeParse({
        ...req.body,
        imageUrl,
        tutorialId,
        order: parseInt(req.body.order)
      });
      
      if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error });
      }
      
      const step = await storage.createTutorialStep(parsedBody.data);
      return res.status(201).json(step);
    } catch (error) {
      console.error("Error adding tutorial step:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });
  
  // Get steps for a tutorial
  router.get('/tutorials/:id/steps', async (req: Request, res: Response) => {
    try {
      const tutorialId = parseInt(req.params.id);
      if (isNaN(tutorialId)) {
        return res.status(400).json({ error: "Invalid tutorial ID" });
      }
      
      const steps = await storage.getTutorialSteps(tutorialId);
      return res.json(steps);
    } catch (error) {
      console.error("Error fetching tutorial steps:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Register API routes
  app.use('/api', router);

  return httpServer || createServer(app);
}
