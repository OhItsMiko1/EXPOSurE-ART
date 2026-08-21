import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertArtworkSchema, 
  insertCommissionSchema,
  insertTutorialSchema,
  insertTutorialStepSchema,
  insertPasswordResetTokenSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "./email";

const BCRYPT_SALT_ROUNDS = 10;
// Add auth middleware
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      user?: any;
    }
  }
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
      // For our simple auth implementation, we'll consider the token to be the username
      // In a real implementation, this would validate a JWT or session token
      const user = await storage.getUserByUsername(token);
      
      if (user) {
        // Don't expose password in req.user
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
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

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
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

export async function registerRoutes(app: Express, httpServer?: Server): Promise<Server> {
  const router = express.Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // User routes
  router.post('/users/register', async (req: Request, res: Response) => {
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

  router.post('/users/login', async (req: Request, res: Response) => {
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
      res.cookie('auth_token', username, { 
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
  router.post('/users/forgot-password', async (req: Request, res: Response) => {
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
  
  router.post('/users/reset-password', async (req: Request, res: Response) => {
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
      const { email, firebaseUid, displayName, photoURL } = req.body;
      
      if (!email || !firebaseUid) {
        return res.status(400).json({ message: "Email and Firebase UID are required" });
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
      }

      // Set auth cookie, same as the regular login route
      res.cookie('auth_token', user.username, {
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
      
      const imageUrl = `/uploads/${req.file.filename}`;
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
        res.status(500).json({ message: "Server error" });
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
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const updatedArtwork = await storage.updateArtwork(id, updateData);
      res.status(200).json(updatedArtwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
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
      let commissions;
      
      if (req.query.artistId) {
        const artistId = parseInt(req.query.artistId as string);
        commissions = await storage.getCommissionsByArtist(artistId);
      } else if (req.query.buyerId) {
        const buyerId = parseInt(req.query.buyerId as string);
        commissions = await storage.getCommissionsByBuyer(buyerId);
      } else {
        commissions = await storage.getCommissions();
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
      
      res.status(200).json(commission);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.post('/commissions', async (req: Request, res: Response) => {
    try {
      const commissionData = insertCommissionSchema.parse({
        ...req.body,
        buyerId: parseInt(req.body.buyerId),
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
        imageUrl = `/uploads/${req.file.filename}`;
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
      return res.status(500).json({ error: "Internal server error" });
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
        imageUrl = `/uploads/${req.file.filename}`;
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
      return res.status(500).json({ error: "Internal server error" });
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
