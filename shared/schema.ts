import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  location: text("location"),
  isArtist: boolean("is_artist").default(false).notNull(),
  profileImage: text("profile_image"),
  socialLinks: text("social_links"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Firebase authentication fields
  firebaseUid: text("firebase_uid"),
  // Subscription related fields
  subscriptionTier: text("subscription_tier").default("free").notNull(), // 'free' or 'premium'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Recommendation preferences
  preferredCategories: json("preferred_categories").$type<number[]>(),
  preferredStyles: json("preferred_styles").$type<string[]>(),
  preferredPriceRange: json("preferred_price_range").$type<{min: number, max: number}>(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url").notNull(),
  artistId: integer("artist_id").notNull(),
  categoryId: integer("category_id").notNull(),
  medium: text("medium"),
  dimensions: text("dimensions"),
  forSale: boolean("for_sale").default(true).notNull(),
  isOriginal: boolean("is_original").default(true).notNull(),
  limitedEdition: boolean("limited_edition").default(false),
  editionCount: integer("edition_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  artistId: integer("artist_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: doublePrecision("budget"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User artwork interactions (views, likes, etc.)
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
  interactionType: text("interaction_type").notNull(), // 'view', 'like', 'save', 'purchase'
  interactionDate: timestamp("interaction_date").defaultNow().notNull(),
  duration: integer("duration"), // For view interactions, in seconds
});

// Recommendations for users
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  artworkId: integer("artwork_id").notNull(), 
  score: doublePrecision("score").notNull(), // Relevance score
  reason: text("reason"), // Why this artwork is recommended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  viewed: boolean("viewed").default(false).notNull(),
});

// Learning paths for artists
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  imageUrl: text("image_url"),
  estimatedDuration: integer("estimated_duration"), // In days
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Steps in learning paths
export const learningPathSteps = pgTable("learning_path_steps", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  resources: json("resources").$type<{title: string, url: string, type: string}[]>(),
  estimatedHours: integer("estimated_hours"),
});

// User progress in learning paths
export const userLearningProgress = pgTable(
  "user_learning_progress", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    pathId: integer("path_id").notNull(),
    stepId: integer("step_id").notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
  },
  (table) => {
    return {
      userStepIdx: unique("user_step_idx").on(table.userId, table.stepId),
    }
  }
);

// User skills tracking
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
});

export const userSkills = pgTable(
  "user_skills", 
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    skillId: integer("skill_id").notNull(),
    level: integer("level").default(1).notNull(), // 1-5 rating
    evidenceUrls: json("evidence_urls").$type<string[]>(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userSkillIdx: unique("user_skill_idx").on(table.userId, table.skillId),
    }
  }
);

// Community Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  categoryId: integer("category_id").notNull(),
  createdBy: integer("created_by").notNull(), // Admin/moderator user ID
  isActive: boolean("is_active").default(true).notNull(),
  prizeSummary: text("prize_summary"),
  difficulty: text("difficulty").default("intermediate"), // beginner, intermediate, advanced
});

// Challenge submissions
export const challengeSubmissions = pgTable("challenge_submissions", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  likes: integer("likes").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  comments: json("comments").$type<{userId: number, comment: string, date: string}[]>(),
});

// Art Tutorials
export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Can be rich text or HTML
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  authorId: integer("author_id").notNull(),
  categoryId: integer("category_id").notNull(),
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
  durationMinutes: integer("duration_minutes"),
  published: boolean("published").default(false).notNull(),
  publishDate: timestamp("publish_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  likes: integer("likes").default(0).notNull(),
  views: integer("views").default(0).notNull(),
});

// Tutorial steps or sections
export const tutorialSteps = pgTable("tutorial_steps", {
  id: serial("id").primaryKey(),
  tutorialId: integer("tutorial_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
});

// Collaborative Workspaces
export const collaborations = pgTable("collaborations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  inviteCode: text("invite_code"),
  isPublic: boolean("is_public").default(false).notNull(),
});

// Collaboration members
export const collaborationMembers = pgTable(
  "collaboration_members", 
  {
    id: serial("id").primaryKey(),
    collaborationId: integer("collaboration_id").notNull(),
    userId: integer("user_id").notNull(),
    role: text("role").default("member").notNull(), // "owner", "admin", "member"
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      collabUserIdx: unique("collab_user_idx").on(table.collaborationId, table.userId),
    }
  }
);

// Collaborative artwork being worked on
export const collaborationArtworks = pgTable("collaboration_artworks", {
  id: serial("id").primaryKey(),
  collaborationId: integer("collaboration_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  currentImageUrl: text("current_image_url").notNull(),
  status: text("status").default("in_progress").notNull(), // "in_progress", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// History of edits to collaborative artwork
export const collaborationEdits = pgTable("collaboration_edits", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").notNull(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
});

// Social media sharing
export const socialShares = pgTable("social_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  artworkId: integer("artwork_id").notNull(),
  platform: text("platform").notNull(), // "twitter", "instagram", "facebook", etc.
  shareDate: timestamp("share_date").defaultNow().notNull(),
  shareUrl: text("share_url"),
  engagement: json("engagement").$type<{likes: number, comments: number, shares: number}>(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  artworkId: integer("artwork_id"),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  bio: true,
  location: true,
  isArtist: true,
  profileImage: true,
  socialLinks: true,
  firebaseUid: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export const insertArtworkSchema = createInsertSchema(artworks).pick({
  title: true,
  description: true,
  price: true,
  imageUrl: true,
  artistId: true,
  categoryId: true,
  medium: true,
  dimensions: true,
  forSale: true,
  isOriginal: true,
  limitedEdition: true,
  editionCount: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).pick({
  buyerId: true,
  artistId: true,
  title: true,
  description: true,
  budget: true,
  status: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).pick({
  userId: true,
  artworkId: true,
  interactionType: true,
  duration: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  artworkId: true,
  score: true,
  reason: true,
});

// Update user schema to include new subscription and preference fields
export const updateUserPreferencesSchema = z.object({
  preferredCategories: z.array(z.number()).optional(),
  preferredStyles: z.array(z.string()).optional(),
  preferredPriceRange: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
});

export const updateUserSubscriptionSchema = z.object({
  subscriptionTier: z.enum(['free', 'premium']),
  subscriptionStartDate: z.date().optional(),
  subscriptionEndDate: z.date().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;

export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;

// Insert schemas for new tables
export const insertLearningPathSchema = createInsertSchema(learningPaths).pick({
  title: true,
  description: true,
  level: true,
  imageUrl: true,
  estimatedDuration: true,
  categoryId: true,
});

export const insertLearningPathStepSchema = createInsertSchema(learningPathSteps).pick({
  pathId: true,
  title: true,
  description: true,
  order: true,
  resources: true,
  estimatedHours: true,
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).pick({
  userId: true,
  pathId: true,
  stepId: true,
  completed: true,
  completedAt: true,
  notes: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  description: true,
  categoryId: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).pick({
  userId: true,
  skillId: true,
  level: true,
  evidenceUrls: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  imageUrl: true,
  startDate: true,
  endDate: true,
  categoryId: true,
  createdBy: true,
  isActive: true,
  prizeSummary: true,
  difficulty: true,
});

export const insertChallengeSubmissionSchema = createInsertSchema(challengeSubmissions).pick({
  challengeId: true,
  userId: true,
  artworkId: true,
  comments: true,
});

export const insertTutorialSchema = createInsertSchema(tutorials).pick({
  title: true,
  description: true,
  content: true,
  imageUrl: true,
  videoUrl: true,
  authorId: true,
  categoryId: true,
  difficulty: true,
  durationMinutes: true,
  published: true,
  publishDate: true,
});

export const insertTutorialStepSchema = createInsertSchema(tutorialSteps).pick({
  tutorialId: true,
  title: true,
  content: true,
  order: true,
  imageUrl: true,
  videoUrl: true,
});

export const insertCollaborationSchema = createInsertSchema(collaborations).pick({
  title: true,
  description: true,
  createdBy: true,
  isActive: true,
  inviteCode: true,
  isPublic: true,
});

export const insertCollaborationMemberSchema = createInsertSchema(collaborationMembers).pick({
  collaborationId: true,
  userId: true,
  role: true,
});

export const insertCollaborationArtworkSchema = createInsertSchema(collaborationArtworks).pick({
  collaborationId: true,
  title: true,
  description: true,
  currentImageUrl: true,
  status: true,
});

export const insertCollaborationEditSchema = createInsertSchema(collaborationEdits).pick({
  artworkId: true,
  userId: true,
  imageUrl: true,
  description: true,
});

export const insertSocialShareSchema = createInsertSchema(socialShares).pick({
  userId: true,
  artworkId: true,
  platform: true,
  shareUrl: true,
  engagement: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  artworkId: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type UpdateUserSubscription = z.infer<typeof updateUserSubscriptionSchema>;

// Types for new entities
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;

export type InsertLearningPathStep = z.infer<typeof insertLearningPathStepSchema>;
export type LearningPathStep = typeof learningPathSteps.$inferSelect;

export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertChallengeSubmission = z.infer<typeof insertChallengeSubmissionSchema>;
export type ChallengeSubmission = typeof challengeSubmissions.$inferSelect;

export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type Tutorial = typeof tutorials.$inferSelect;

export type InsertTutorialStep = z.infer<typeof insertTutorialStepSchema>;
export type TutorialStep = typeof tutorialSteps.$inferSelect;

export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Collaboration = typeof collaborations.$inferSelect;

export type InsertCollaborationMember = z.infer<typeof insertCollaborationMemberSchema>;
export type CollaborationMember = typeof collaborationMembers.$inferSelect;

export type InsertCollaborationArtwork = z.infer<typeof insertCollaborationArtworkSchema>;
export type CollaborationArtwork = typeof collaborationArtworks.$inferSelect;

export type InsertCollaborationEdit = z.infer<typeof insertCollaborationEditSchema>;
export type CollaborationEdit = typeof collaborationEdits.$inferSelect;

export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;
export type SocialShare = typeof socialShares.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
