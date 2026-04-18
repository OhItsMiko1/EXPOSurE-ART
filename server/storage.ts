import { 
  users, type User, type InsertUser, type UpdateUserPreferences, type UpdateUserSubscription,
  categories, type Category, type InsertCategory,
  artworks, type Artwork, type InsertArtwork,
  commissions, type Commission, type InsertCommission,
  userInteractions, type UserInteraction, type InsertUserInteraction,
  recommendations, type Recommendation, type InsertRecommendation,

  // Learning path imports
  learningPaths, type LearningPath, type InsertLearningPath,
  learningPathSteps, type LearningPathStep, type InsertLearningPathStep,
  userLearningProgress, type UserLearningProgress, type InsertUserLearningProgress,

  // Skill tracking imports
  skills, type Skill, type InsertSkill,
  userSkills, type UserSkill, type InsertUserSkill,

  // Challenge imports
  challenges, type Challenge, type InsertChallenge,
  challengeSubmissions, type ChallengeSubmission, type InsertChallengeSubmission,

  // Tutorial imports
  tutorials, type Tutorial, type InsertTutorial,
  tutorialSteps, type TutorialStep, type InsertTutorialStep,

  // Collaboration imports
  collaborations, type Collaboration, type InsertCollaboration,
  collaborationMembers, type CollaborationMember, type InsertCollaborationMember,
  collaborationArtworks, type CollaborationArtwork, type InsertCollaborationArtwork,
  collaborationEdits, type CollaborationEdit, type InsertCollaborationEdit,

  // Social sharing imports
  socialShares, type SocialShare, type InsertSocialShare,

  // Password reset imports
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gt, lt, between, isNull, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getArtists(): Promise<User[]>;
  getFeaturedArtists(limit?: number): Promise<User[]>;
  updateUserPreferences(userId: number, preferences: UpdateUserPreferences): Promise<User | undefined>;
  updateUserSubscription(userId: number, subscription: UpdateUserSubscription): Promise<User | undefined>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;

  // Password reset operations
  createPasswordResetToken(userId: number): Promise<PasswordResetToken>;
  getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: number): Promise<PasswordResetToken | undefined>;
  updateUserFirebaseInfo(userId: number, info: { firebaseUid: string }): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Artwork operations
  getArtworks(): Promise<Artwork[]>;
  getArtwork(id: number): Promise<Artwork | undefined>;
  getArtworksByArtist(artistId: number): Promise<Artwork[]>;
  getArtworksByCategory(categoryId: number): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  deleteArtwork(id: number): Promise<boolean>;
  getFeaturedArtworks(limit?: number): Promise<Artwork[]>;

  // Commission operations
  getCommissions(): Promise<Commission[]>;
  getCommission(id: number): Promise<Commission | undefined>;
  getCommissionsByArtist(artistId: number): Promise<Commission[]>;
  getCommissionsByBuyer(buyerId: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommissionStatus(id: number, status: string): Promise<Commission | undefined>;

  // User interaction operations
  createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getUserInteractions(userId: number): Promise<UserInteraction[]>;
  getArtworkInteractions(artworkId: number): Promise<UserInteraction[]>;

  // Recommendation operations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsForUser(userId: number, limit?: number): Promise<Recommendation[]>;
  markRecommendationAsViewed(id: number): Promise<Recommendation | undefined>;
  generateRecommendationsForUser(userId: number): Promise<Recommendation[]>;

  // Learning paths operations
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  getLearningPathsByCategory(categoryId: number): Promise<LearningPath[]>;
  getLearningPathsByLevel(level: string): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getLearningPathSteps(pathId: number): Promise<LearningPathStep[]>;
  createLearningPathStep(step: InsertLearningPathStep): Promise<LearningPathStep>;
  getUserLearningProgress(userId: number): Promise<UserLearningProgress[]>;
  updateUserLearningProgress(progressId: number, completed: boolean): Promise<UserLearningProgress | undefined>;
  createUserLearningProgress(progress: InsertUserLearningProgress): Promise<UserLearningProgress>;

  // Skills operations
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByCategory(categoryId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: number): Promise<UserSkill[]>;
  updateUserSkill(userId: number, skillId: number, level: number): Promise<UserSkill | undefined>;
  createUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;

  // Challenge operations
  getChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengeSubmissions(challengeId: number): Promise<ChallengeSubmission[]>;
  getUserChallengeSubmissions(userId: number): Promise<ChallengeSubmission[]>;
  createChallengeSubmission(submission: InsertChallengeSubmission): Promise<ChallengeSubmission>;

  // Tutorial operations
  getTutorials(): Promise<Tutorial[]>;
  getTutorial(id: number): Promise<Tutorial | undefined>;
  getTutorialsByCategory(categoryId: number): Promise<Tutorial[]>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  getTutorialSteps(tutorialId: number): Promise<TutorialStep[]>;
  createTutorialStep(step: InsertTutorialStep): Promise<TutorialStep>;
  incrementTutorialViews(tutorialId: number): Promise<Tutorial | undefined>;

  // Collaboration operations
  getCollaborations(): Promise<Collaboration[]>;
  getCollaboration(id: number): Promise<Collaboration | undefined>;
  getUserCollaborations(userId: number): Promise<Collaboration[]>;
  createCollaboration(collaboration: InsertCollaboration): Promise<Collaboration>;
  getCollaborationMembers(collaborationId: number): Promise<CollaborationMember[]>;
  addCollaborationMember(member: InsertCollaborationMember): Promise<CollaborationMember>;
  getCollaborationArtworks(collaborationId: number): Promise<CollaborationArtwork[]>;
  createCollaborationArtwork(artwork: InsertCollaborationArtwork): Promise<CollaborationArtwork>;
  addCollaborationEdit(edit: InsertCollaborationEdit): Promise<CollaborationEdit>;
  getCollaborationEdits(artworkId: number): Promise<CollaborationEdit[]>;

  // Social sharing operations
  createSocialShare(share: InsertSocialShare): Promise<SocialShare>;
  getUserSocialShares(userId: number): Promise<SocialShare[]>;
  getArtworkSocialShares(artworkId: number): Promise<SocialShare[]>;
  updateSocialShareEngagement(shareId: number, engagement: {likes: number, comments: number, shares: number}): Promise<SocialShare | undefined>;

  // Password reset operations already defined above
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private artworks: Map<number, Artwork>;
  private commissions: Map<number, Commission>;
  private userInteractions: Map<number, UserInteraction>;
  private recommendations: Map<number, Recommendation>;
  private tutorials: Map<number, Tutorial>;
  private tutorialSteps: Map<number, TutorialStep>;
  private passwordResetTokens: Map<number, PasswordResetToken>;
  private userCurrentId: number;
  private categoryCurrentId: number;
  private artworkCurrentId: number;
  private commissionCurrentId: number;
  private userInteractionCurrentId: number;
  private recommendationCurrentId: number;
  private tutorialCurrentId: number;
  private tutorialStepCurrentId: number;
  private passwordResetTokenCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.artworks = new Map();
    this.commissions = new Map();
    this.userInteractions = new Map();
    this.recommendations = new Map();
    this.tutorials = new Map();
    this.tutorialSteps = new Map();
    this.passwordResetTokens = new Map();
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.artworkCurrentId = 1;
    this.commissionCurrentId = 1;
    this.userInteractionCurrentId = 1;
    this.recommendationCurrentId = 1;
    this.tutorialCurrentId = 1;
    this.tutorialStepCurrentId = 1;
    this.passwordResetTokenCurrentId = 1;

    // Add some default categories
    const defaultCategories = [
      { name: "Digital" },
      { name: "Painting" },
      { name: "Illustration" },
      { name: "Photography" },
      { name: "Sculpture" }
    ];

    defaultCategories.forEach(category => {
      this.createCategory({ name: category.name });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();

    // Ensure all nullable fields have explicit values
    const userToInsert = {
      ...insertUser,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      isArtist: insertUser.isArtist ?? false,
      profileImage: insertUser.profileImage ?? null,
      socialLinks: insertUser.socialLinks ?? null,
      // Default values for subscription fields
      subscriptionTier: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      // Default values for preference fields
      preferredCategories: null,
      preferredStyles: null,
      preferredPriceRange: null
    };

    const user: User = { ...userToInsert, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getArtists(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isArtist);
  }

  async getFeaturedArtists(limit: number = 4): Promise<User[]> {
    const artists = await this.getArtists();
    return artists.slice(0, limit);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Artwork operations
  async getArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values());
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async getArtworksByArtist(artistId: number): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).filter(
      artwork => artwork.artistId === artistId
    );
  }

  async getArtworksByCategory(categoryId: number): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).filter(
      artwork => artwork.categoryId === categoryId
    );
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.artworkCurrentId++;
    const createdAt = new Date();

    // Ensure all nullable fields have explicit values
    const artworkToInsert = {
      ...insertArtwork,
      description: insertArtwork.description ?? null,
      medium: insertArtwork.medium ?? null,
      dimensions: insertArtwork.dimensions ?? null,
      forSale: insertArtwork.forSale ?? true,
      isOriginal: insertArtwork.isOriginal ?? true,
      limitedEdition: insertArtwork.limitedEdition ?? null,
      editionCount: insertArtwork.editionCount ?? null
    };

    const artwork: Artwork = { ...artworkToInsert, id, createdAt };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const existingArtwork = this.artworks.get(id);
    if (!existingArtwork) return undefined;

    const updatedArtwork = { ...existingArtwork, ...artwork };
    this.artworks.set(id, updatedArtwork);
    return updatedArtwork;
  }

  async deleteArtwork(id: number): Promise<boolean> {
    return this.artworks.delete(id);
  }

  async getFeaturedArtworks(limit: number = 6): Promise<Artwork[]> {
    const artworks = await this.getArtworks();
    return artworks.slice(0, limit);
  }

  // Commission operations
  async getCommissions(): Promise<Commission[]> {
    return Array.from(this.commissions.values());
  }

  async getCommission(id: number): Promise<Commission | undefined> {
    return this.commissions.get(id);
  }

  async getCommissionsByArtist(artistId: number): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(
      commission => commission.artistId === artistId
    );
  }

  async getCommissionsByBuyer(buyerId: number): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(
      commission => commission.buyerId === buyerId
    );
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const id = this.commissionCurrentId++;
    const createdAt = new Date();

    // Ensure all required fields are present and nullable fields have explicit values
    const commissionToInsert = {
      ...insertCommission,
      status: insertCommission.status ?? 'pending',
      budget: insertCommission.budget ?? null
    };

    const commission: Commission = { ...commissionToInsert, id, createdAt };
    this.commissions.set(id, commission);
    return commission;
  }

  async updateCommissionStatus(id: number, status: string): Promise<Commission | undefined> {
    const existingCommission = this.commissions.get(id);
    if (!existingCommission) return undefined;

    const updatedCommission = { ...existingCommission, status };
    this.commissions.set(id, updatedCommission);
    return updatedCommission;
  }

  // User preferences and subscription operations
  async updateUserPreferences(userId: number, preferences: UpdateUserPreferences): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }

    const updatedUser = { 
      ...user,
      preferredCategories: preferences.preferredCategories || null,
      preferredStyles: preferences.preferredStyles || null,
      preferredPriceRange: preferences.preferredPriceRange || null
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserSubscription(userId: number, subscription: UpdateUserSubscription): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }

    const startDate = subscription.subscriptionStartDate || new Date();

    // If user upgrades to premium, set end date to 30 days from start
    let endDate = subscription.subscriptionEndDate;
    if (subscription.subscriptionTier === 'premium' && !endDate) {
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // 30-day subscription
    }

    const updatedUser = {
      ...user,
      subscriptionTier: subscription.subscriptionTier,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate || null,
      stripeCustomerId: subscription.stripeCustomerId || user.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId || user.stripeSubscriptionId
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserFirebaseInfo(userId: number, info: { firebaseUid: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }

    const updatedUser = {
      ...user,
      firebaseUid: info.firebaseUid
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // User interaction operations
  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const id = ++this.userInteractionCurrentId;
    const interactionDate = new Date();

    const newInteraction: UserInteraction = {
      ...interaction,
      id,
      interactionDate,
      duration: interaction.duration ?? null
    };

    this.userInteractions.set(id, newInteraction);
    return newInteraction;
  }

  async getUserInteractions(userId: number): Promise<UserInteraction[]> {
    return Array.from(this.userInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => b.interactionDate.getTime() - a.interactionDate.getTime());
  }

  async getArtworkInteractions(artworkId: number): Promise<UserInteraction[]> {
    return Array.from(this.userInteractions.values())
      .filter(interaction => interaction.artworkId === artworkId)
      .sort((a, b) => b.interactionDate.getTime() - a.interactionDate.getTime());
  }

  // Recommendation operations
  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = ++this.recommendationCurrentId;
    const createdAt = new Date();

    const newRecommendation: Recommendation = {
      ...recommendation,
      id,
      createdAt,
      viewed: false,
      reason: recommendation.reason ?? null
    };

    this.recommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async getRecommendationsForUser(userId: number, limit: number = 10): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async markRecommendationAsViewed(id: number): Promise<Recommendation | undefined> {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) {
      return undefined;
    }

    const updatedRecommendation = { ...recommendation, viewed: true };
    this.recommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  async generateRecommendationsForUser(userId: number): Promise<Recommendation[]> {
    // Get user
    const user = this.users.get(userId);
    if (!user) return [];

    // Get user's interactions
    const userInteractions = await this.getUserInteractions(userId);

    // Get artworks the user has already interacted with
    const interactedArtworkIds = new Set(userInteractions.map(i => i.artworkId));

    // Collect preferred categories
    let preferredCategories: number[] = [];

    // Add explicitly preferred categories
    if (user.preferredCategories) {
      preferredCategories = [...user.preferredCategories];
    }

    // Create a map to count interactions by category
    const categoryInteractions = new Map<number, number>();

    // Count interactions by category
    for (const interaction of userInteractions) {
      const artwork = this.artworks.get(interaction.artworkId);
      if (artwork) {
        const count = categoryInteractions.get(artwork.categoryId) || 0;
        categoryInteractions.set(artwork.categoryId, count + 1);
      }
    }

    // Add top categories from interactions
    const topInteractedCategories = Array.from(categoryInteractions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    // Combine categories, removing duplicates
    preferredCategories = [...new Set([...preferredCategories, ...topInteractedCategories])];

    // Find artworks in preferred categories that user hasn't interacted with yet
    let recommendedArtworks: Artwork[] = [];

    // First try to get recommendations based on preferred categories
    if (preferredCategories.length > 0) {
      for (const categoryId of preferredCategories) {
        const artworksInCategory = await this.getArtworksByCategory(categoryId);

        // Filter out already interacted artworks
        const newArtworks = artworksInCategory.filter(a => !interactedArtworkIds.has(a.id));
        recommendedArtworks = [...recommendedArtworks, ...newArtworks];

        if (recommendedArtworks.length >= 10) break;
      }
    }

    // If we don't have enough, add some random artworks
    if (recommendedArtworks.length < 5) {
      const allArtworks = Array.from(this.artworks.values());
      const randomArtworks = allArtworks
        .filter(a => !interactedArtworkIds.has(a.id) && !recommendedArtworks.some(r => r.id === a.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10 - recommendedArtworks.length);

      recommendedArtworks = [...recommendedArtworks, ...randomArtworks];
    }

    // Create recommendations from the selected artworks
    const newRecommendations: Recommendation[] = [];

    for (const artwork of recommendedArtworks) {
      // Generate a reason for recommendation
      let reason = "";
      if (preferredCategories.includes(artwork.categoryId)) {
        reason = "Based on your preferred art categories";
      } else {
        reason = "You might enjoy exploring this artwork";
      }

      const recommendation: InsertRecommendation = {
        userId,
        artworkId: artwork.id,
        score: Math.random() * 5, // Random score between 0-5
        reason
      };

      const createdRecommendation = await this.createRecommendation(recommendation);
      newRecommendations.push(createdRecommendation);
    }

    return newRecommendations;
  }

  // Tutorial operations
  async getTutorials(): Promise<Tutorial[]> {
    return Array.from(this.tutorials.values());
  }

  async getTutorial(id: number): Promise<Tutorial | undefined> {
    return this.tutorials.get(id);
  }

  async getTutorialsByCategory(categoryId: number): Promise<Tutorial[]> {
    return Array.from(this.tutorials.values()).filter(
      tutorial => tutorial.categoryId === categoryId
    );
  }

  async createTutorial(insertTutorial: InsertTutorial): Promise<Tutorial> {
    const id = this.tutorialCurrentId++;
    const createdAt = new Date();

    // Ensure all nullable fields have explicit values
    const tutorialToInsert = {
      ...insertTutorial,
      description: insertTutorial.description ?? null,
      imageUrl: insertTutorial.imageUrl ?? null,
      durationMinutes: insertTutorial.durationMinutes ?? null,
      published: insertTutorial.published ?? false,
      views: 0
    };

    const tutorial: Tutorial = { ...tutorialToInsert, id, createdAt };
    this.tutorials.set(id, tutorial);
    return tutorial;
  }

  async getTutorialSteps(tutorialId: number): Promise<TutorialStep[]> {
    return Array.from(this.tutorialSteps.values())
      .filter(step => step.tutorialId === tutorialId)
      .sort((a, b) => a.order - b.order);
  }

  async createTutorialStep(insertStep: InsertTutorialStep): Promise<TutorialStep> {
    const id = this.tutorialStepCurrentId++;

    // Ensure all nullable fields have explicit values
    const stepToInsert = {
      ...insertStep,
      imageUrl: insertStep.imageUrl ?? null,
      videoUrl: insertStep.videoUrl ?? null
    };

    const step: TutorialStep = { ...stepToInsert, id };
    this.tutorialSteps.set(id, step);
    return step;
  }

  async incrementTutorialViews(tutorialId: number): Promise<Tutorial | undefined> {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) {
      return undefined;
    }

    const updatedTutorial = { ...tutorial, views: tutorial.views + 1 };
    this.tutorials.set(tutorialId, updatedTutorial);
    return updatedTutorial;
  }

  // Password reset operations
  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    const id = this.passwordResetTokenCurrentId++;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 3600000); // 1 hour expiration

    // Generate a random token
    const tokenBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      tokenBytes[i] = Math.floor(Math.random() * 256);
    }
    const token = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const passwordResetToken: PasswordResetToken = {
      id,
      userId,
      token,
      createdAt,
      expiresAt,
      used: false
    };

    this.passwordResetTokens.set(id, passwordResetToken);
    return passwordResetToken;
  }

  async getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | undefined> {
    return Array.from(this.passwordResetTokens.values()).find(
      (resetToken) => resetToken.token === token && !resetToken.used && resetToken.expiresAt > new Date()
    );
  }

  async markPasswordResetTokenAsUsed(tokenId: number): Promise<PasswordResetToken | undefined> {
    const token = this.passwordResetTokens.get(tokenId);
    if (!token) {
      return undefined;
    }

    const updatedToken = { ...token, used: true };
    this.passwordResetTokens.set(tokenId, updatedToken);
    return updatedToken;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }

    const updatedUser = { ...user, password: newPassword };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Make sure null values are explicitly set for fields that might be undefined
    const userToInsert = {
      ...insertUser,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      isArtist: insertUser.isArtist ?? false,
      profileImage: insertUser.profileImage ?? null,
      socialLinks: insertUser.socialLinks ?? null,
      // Default values for subscription fields
      subscriptionTier: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      // Default values for preference fields
      preferredCategories: null,
      preferredStyles: null,
      preferredPriceRange: null
    };

    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }

  async getArtists(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isArtist, true));
  }

  async getFeaturedArtists(limit: number = 4): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isArtist, true)).limit(limit);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Artwork operations
  async getArtworks(): Promise<Artwork[]> {
    return await db.select().from(artworks);
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async getArtworksByArtist(artistId: number): Promise<Artwork[]> {
    return await db.select().from(artworks).where(eq(artworks.artistId, artistId));
  }

  async getArtworksByCategory(categoryId: number): Promise<Artwork[]> {
    return await db.select().from(artworks).where(eq(artworks.categoryId, categoryId));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    // Ensure all nullable fields have explicit null values
    const artworkToInsert = {
      ...insertArtwork,
      description: insertArtwork.description ?? null,
      medium: insertArtwork.medium ?? null,
      dimensions: insertArtwork.dimensions ?? null,
      forSale: insertArtwork.forSale ?? true,
      isOriginal: insertArtwork.isOriginal ?? true,
      limitedEdition: insertArtwork.limitedEdition ?? null,
      editionCount: insertArtwork.editionCount ?? null
    };

    const [artwork] = await db.insert(artworks).values(artworkToInsert).returning();
    return artwork;
  }

  async updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const [updatedArtwork] = await db.update(artworks).set(artwork).where(eq(artworks.id, id)).returning();
    return updatedArtwork;
  }

  async deleteArtwork(id: number): Promise<boolean> {
    const result = await db.delete(artworks).where(eq(artworks.id, id));
    return true; // In PostgreSQL with Drizzle, deletion doesn't return meaningful count
  }

  async getFeaturedArtworks(limit: number = 6): Promise<Artwork[]> {
    return await db.select().from(artworks).limit(limit);
  }

  // Commission operations
  async getCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions);
  }

  async getCommission(id: number): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission;
  }

  async getCommissionsByArtist(artistId: number): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.artistId, artistId));
  }

  async getCommissionsByBuyer(buyerId: number): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.buyerId, buyerId));
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    // Ensure all required fields are present and nullable fields have explicit null values
    const commissionToInsert = {
      ...insertCommission,
      status: insertCommission.status ?? 'pending',
      budget: insertCommission.budget ?? null
    };

    const [commission] = await db.insert(commissions).values(commissionToInsert).returning();
    return commission;
  }

  async updateCommissionStatus(id: number, status: string): Promise<Commission | undefined> {
    const [updatedCommission] = await db.update(commissions).set({ status }).where(eq(commissions.id, id)).returning();
    return updatedCommission;
  }

  // User preferences and subscription operations
  async updateUserPreferences(userId: number, preferences: UpdateUserPreferences): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        preferredCategories: preferences.preferredCategories ? sql`${JSON.stringify(preferences.preferredCategories)}` : null,
        preferredStyles: preferences.preferredStyles ? sql`${JSON.stringify(preferences.preferredStyles)}` : null,
        preferredPriceRange: preferences.preferredPriceRange ? sql`${JSON.stringify(preferences.preferredPriceRange)}` : null
      })      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserSubscription(userId: number, subscription: UpdateUserSubscription): Promise<User | undefined> {
    const startDate = subscription.subscriptionStartDate || new Date();

    // If user upgrades to premium, set end date to 30 days from start
    let endDate = subscription.subscriptionEndDate;
    if (subscription.subscriptionTier === 'premium' && !endDate) {
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // 30-day subscription
    }

    const [updatedUser] = await db.update(users)
      .set({
        subscriptionTier: subscription.subscriptionTier,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate || null,
        stripeCustomerId: subscription.stripeCustomerId || undefined,
        stripeSubscriptionId: subscription.stripeSubscriptionId || undefined
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserFirebaseInfo(userId: number, info: { firebaseUid: string }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        firebaseUid: info.firebaseUid
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // User interaction operations
  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const [newInteraction] = await db.insert(userInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async getUserInteractions(userId: number): Promise<UserInteraction[]> {
    return await db.select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId))
      .orderBy(desc(userInteractions.interactionDate));
  }

  async getArtworkInteractions(artworkId: number): Promise<UserInteraction[]> {
    return await db.select()
      .from(userInteractions)
      .where(eq(userInteractions.artworkId, artworkId))
      .orderBy(desc(userInteractions.interactionDate));
  }

  // Recommendation operations
  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const [newRecommendation] = await db.insert(recommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async getRecommendationsForUser(userId: number, limit: number = 10): Promise<Recommendation[]> {
    return await db.select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.score))
      .limit(limit);
  }

  async markRecommendationAsViewed(id: number): Promise<Recommendation | undefined> {
    const [updatedRecommendation] = await db.update(recommendations)
      .set({ viewed: true })
      .where(eq(recommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  // This is the main recommendation engine method that generates personalized recommendations
  async generateRecommendationsForUser(userId: number): Promise<Recommendation[]> {
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }

    // Get user's interactions to understand preferences
    const userInteractionsData = await this.getUserInteractions(userId);

    // Get user's explicit preferences if set
    const userPreferences = {
      categories: user.preferredCategories || [],
      styles: user.preferredStyles || [],
      priceRange: user.preferredPriceRange || { min: 0, max: 10000 } // Default price range
    };

    // 1. First, find artworks the user has interacted with
    const interactedArtworkIds = new Set(userInteractionsData.map(i => i.artworkId));

    // 2. Calculate category preferences from interactions
    const categoryInteractions = new Map<number, number>();
    const viewedArtworks: Artwork[] = [];

    // Fetch full artwork data for artworks the user has interacted with
    for (const interaction of userInteractionsData) {
      const artwork = await this.getArtwork(interaction.artworkId);
      if (artwork) {
        viewedArtworks.push(artwork);

        // Increment category count based on interaction type
        const weight = interaction.interactionType === 'view' ? 1 :
                      interaction.interactionType === 'like' ? 3 :
                      interaction.interactionType === 'save' ? 5 :
                      interaction.interactionType === 'purchase' ? 10 : 0;

        const categoryId = artwork.categoryId;
        categoryInteractions.set(
          categoryId, 
          (categoryInteractions.get(categoryId) || 0) + weight
        );
      }
    }

    // 3. Get preferred categories - both explicit preferences and those inferred from interactions
    let preferredCategories: number[] = [];

    // Add explicitly preferred categories
    if (user.preferredCategories && Array.isArray(user.preferredCategories)) {
      preferredCategories = [...user.preferredCategories];
    }

    // Add top categories from interactions
    const topInteractedCategories = Array.from(categoryInteractions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    preferredCategories = [...new Set([...preferredCategories, ...topInteractedCategories])];

    // 4. Find artworks in preferred categories that user hasn't interacted with yet
    let recommendedArtworks: Artwork[] = [];

    // First try to get recommendations based on preferred categories
    if (preferredCategories.length > 0) {
      for (const categoryId of preferredCategories) {
        const artworksInCategory = await this.getArtworksByCategory(categoryId);

        // Filter out already interacted artworks
        const newArtworks = artworksInCategory.filter(a => !interactedArtworkIds.has(a.id));
        recommendedArtworks = [...recommendedArtworks, ...newArtworks];
      }
    }

    // If we don't have enough, add some other recent artworks
    if (recommendedArtworks.length < 10) {
      const allArtworks = await this.getArtworks();
      const otherArtworks = allArtworks
        .filter(a => !interactedArtworkIds.has(a.id) && !recommendedArtworks.some(r => r.id === a.id))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort by newest
        .slice(0, 10 - recommendedArtworks.length);

      recommendedArtworks = [...recommendedArtworks, ...otherArtworks];
    }

    // 5. Calculate recommendation scores and create recommendation records
    const recommendations: Recommendation[] = [];

    for (const artwork of recommendedArtworks) {
      // Calculate base score
      let score = 0.5; // Default base score

      // Boost score if artwork is in a preferred category
      if (preferredCategories.includes(artwork.categoryId)) {
        score += 0.3;
      }

      // Boost score if artwork is within preferred price range
      const priceRange = user.preferredPriceRange as { min: number, max: number } | null;
      if (priceRange && artwork.price >= priceRange.min && artwork.price <= priceRange.max) {
        score += 0.2;
      }

      // Generate reason for recommendation
      let reason = 'Based on your interest in similar artworks';

      if (preferredCategories.includes(artwork.categoryId)) {
        const category = await this.getCategory(artwork.categoryId);
        if (category) {
          reason = `Based on your interest in ${category.name}`;
        }
      }

      // Create recommendation in database
      const recommendation = await this.createRecommendation({
        userId,
        artworkId: artwork.id,
        score,
        reason
      });

      recommendations.push(recommendation);
    }

    // Sort by score and return
    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Tutorial operations
  async getTutorials(): Promise<Tutorial[]> {
    return await db.select().from(tutorials);
  }

  async getTutorial(id: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial;
  }

  async getTutorialsByCategory(categoryId: number): Promise<Tutorial[]> {
    return await db.select().from(tutorials).where(eq(tutorials.categoryId, categoryId));
  }

  async createTutorial(insertTutorial: InsertTutorial): Promise<Tutorial> {
    // Ensure all nullable fields have explicit values
    const tutorialToInsert = {
      ...insertTutorial,
      description: insertTutorial.description ?? null,
      imageUrl: insertTutorial.imageUrl ?? null,
      durationMinutes: insertTutorial.durationMinutes ?? null,
      published: insertTutorial.published ?? false,
      views: 0
    };

    const [tutorial] = await db.insert(tutorials).values(tutorialToInsert).returning();
    return tutorial;
  }

  async getTutorialSteps(tutorialId: number): Promise<TutorialStep[]> {
    return await db.select()
      .from(tutorialSteps)
      .where(eq(tutorialSteps.tutorialId, tutorialId))
      .orderBy(tutorialSteps.order);
  }

  async createTutorialStep(insertStep: InsertTutorialStep): Promise<TutorialStep> {
    // Ensure all nullable fields have explicit values
    const stepToInsert = {
      ...insertStep,
      imageUrl: insertStep.imageUrl ?? null,
      videoUrl: insertStep.videoUrl ?? null
    };

    const [step] = await db.insert(tutorialSteps).values(stepToInsert).returning();
    return step;
  }

  async incrementTutorialViews(tutorialId: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, tutorialId));
    if (!tutorial) {
      return undefined;
    }

    const [updatedTutorial] = await db.update(tutorials)
      .set({ views: tutorial.views + 1 })
      .where(eq(tutorials.id, tutorialId))
      .returning();
    return updatedTutorial;
  }

  // Password reset operations
  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 3600000); // 1 hour expiration

    // Generate a random token
    const tokenBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      tokenBytes[i] = Math.floor(Math.random() * 256);
    }
    const token = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const [passwordResetToken] = await db.insert(passwordResetTokens)
      .values({
        userId,
        token,
        createdAt,
        expiresAt,
        used: false
      })
      .returning();

    return passwordResetToken;
  }

  async getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    const [resetToken] = await db.select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      );
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(tokenId: number): Promise<PasswordResetToken | undefined> {
    const [updatedToken] = await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId))
      .returning();
    return updatedToken;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  }
}

// Switch from MemStorage to DatabaseStorage
// Create a basic fixed version of the database storage class
export class FixedDatabaseStorage extends DatabaseStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    // Make sure null values are explicitly set for fields that might be undefined
    const userToInsert = {
      ...insertUser,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      isArtist: insertUser.isArtist ?? false,
      profileImage: insertUser.profileImage ?? null,
      socialLinks: insertUser.socialLinks ?? null,
      // Default values for subscription fields
      subscriptionTier: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      // Default values for preference fields
      preferredCategories: null,
      preferredStyles: null,
      preferredPriceRange: null
    };

    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    console.log(`Updating password for user ${userId}`);
    try {
      const [updatedUser] = await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.id, userId))
        .returning();
      console.log('Password update successful');
      return updatedUser;
    } catch (error) {
      console.error('Error updating password:', error);
      return undefined;
    }
  }
}

export const storage = new FixedDatabaseStorage();

// Create admin user
(async () => {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    await storage.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@exposure.art",
      fullName: "Admin",
      isArtist: false,
      isAdmin: true
    });
  }
})();