// Type definitions for the application
import { z } from "zod";
import { 
  insertUserSchema, 
  insertArtworkSchema, 
  insertCommissionSchema,
  insertCategorySchema,
  insertTutorialSchema,
  insertTutorialStepSchema
} from "@shared/schema";

// User types
export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  location?: string;
  isArtist: boolean;
  isAdmin?: boolean;
  profileImage?: string;
  socialLinks?: string;
  // Firebase authentication fields
  firebaseUid?: string;
  // Subscription fields
  subscriptionTier?: 'free' | 'premium';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // Preference fields
  preferredCategories?: number[];
  preferredStyles?: string[];
  preferredPriceRange?: { min: number; max: number };
  createdAt: Date;
};

export type AuthUser = User & {
  isAuthenticated: boolean;
};

// Category types
export type Category = {
  id: number;
  name: string;
};

// Artwork types
export type Artwork = {
  id: number;
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  artistId: number;
  categoryId: number;
  medium?: string;
  dimensions?: string;
  forSale: boolean;
  isOriginal: boolean;
  limitedEdition?: boolean;
  editionCount?: number;
  createdAt: Date;
  
  // Frontend display fields (not from API)
  artistName?: string; 
  categoryName?: string;
};

// Commission types
export type Commission = {
  id: number;
  buyerId: number;
  artistId: number;
  title: string;
  description: string;
  budget?: number;
  status: string;
  createdAt: Date;
  
  // Frontend display fields (not from API)
  buyerName?: string;
  artistName?: string;
};

export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  artworkId?: number | null;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Conversation = {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
};

// Tutorial types
export type Tutorial = {
  id: number;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId: number;
  categoryId: number;
  difficulty?: string;
  durationMinutes?: number;
  published: boolean;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  
  // Frontend display fields (not from API)
  authorName?: string;
  categoryName?: string;
  steps?: TutorialStep[];
};

// Tutorial step types
export type TutorialStep = {
  id: number;
  tutorialId: number;
  title: string;
  content: string;
  order: number;
  imageUrl?: string;
  videoUrl?: string;
};

// Form validation schemas (extending from shared schemas)
export const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const uploadArtworkFormSchema = insertArtworkSchema.extend({
  image: z.any().refine(files => files?.length === 1, "Image is required"),
}).omit({ imageUrl: true });

// Same as uploadArtworkFormSchema, but the image is optional -- editing an
// existing artwork should keep its current image unless a new one is picked.
export const editArtworkFormSchema = insertArtworkSchema.extend({
  image: z.any().optional(),
}).omit({ imageUrl: true });

export const commissionFormSchema = insertCommissionSchema.extend({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
});

// Tutorial form schemas
export const createTutorialFormSchema = insertTutorialSchema.extend({
  image: z.any().optional(),
  video: z.any().optional(),
}).omit({ imageUrl: true, videoUrl: true });

export const createTutorialStepFormSchema = insertTutorialStepSchema.extend({
  image: z.any().optional(),
  video: z.any().optional(), 
}).omit({ imageUrl: true, videoUrl: true });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type UploadArtworkFormValues = z.infer<typeof uploadArtworkFormSchema>;
export type EditArtworkFormValues = z.infer<typeof editArtworkFormSchema>;
export type CommissionFormValues = z.infer<typeof commissionFormSchema>;
export type CreateTutorialFormValues = z.infer<typeof createTutorialFormSchema>;
export type CreateTutorialStepFormValues = z.infer<typeof createTutorialStepFormSchema>;
