import { pgTable, text, serial, integer, timestamp, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/user";

// --- Schema Definitions ---

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  status: text("status").notNull().default("processing"), // 'pending', 'processing', 'completed', 'failed'
  playerColor: text("player_color"), // e.g., 'red', 'blue' or null if bbox used
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  
  // Results
  distanceCoveredKm: doublePrecision("distance_covered_km"),
  averageSpeedKmh: doublePrecision("average_speed_kmh"),
  maxSpeedKmh: doublePrecision("max_speed_kmh"),
  ballTouches: integer("ball_touches"),
  shots: integer("shots"),
  shotsOnTarget: integer("shots_on_target"),
  keyPasses: integer("key_passes"),
  dribbles: integer("dribbles"),
  passes: integer("passes"),
  tackles: integer("tackles"),
  foulsDrawn: integer("fouls_drawn"),
  offsides: integer("offsides"),
  
  performanceRating: doublePrecision("performance_rating"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  proAnalysis: text("pro_analysis"),
  scoutRecommendation: text("scout_recommendation"),
  
  // New monetization features
  marketValue: text("market_value"),
  similarProPlayer: text("similar_pro_player"),
  tacticalRole: text("tactical_role"),
  potentialCeiling: text("potential_ceiling"), // e.g., 'Top 5 Leagues', 'National Team', etc.
  workRate: text("work_rate"), // 'High/High', 'Medium/Low', etc.
  injuryRisk: text("injury_risk"), // 'Low', 'Moderate', 'High'
  
  heatmapImageUrl: text("heatmap_image_url"),
  playerAge: text("player_age"),
  currentClub: text("current_club_name"),
  matchAnalyzed: text("match_analyzed"),
  
  // Stored JSON data for raw coordinates if needed
  trajectoryData: jsonb("trajectory_data"),
});

export const insertVideoSchema = createInsertSchema(videos).omit({ 
  id: true, 
  uploadDate: true,
  distanceCoveredKm: true,
  averageSpeedKmh: true,
  maxSpeedKmh: true,
  ballTouches: true,
  shots: true,
  shotsOnTarget: true,
  keyPasses: true,
  dribbles: true,
  passes: true,
  tackles: true,
  foulsDrawn: true,
  offsides: true,
  performanceRating: true,
  strengths: true,
  weaknesses: true,
  heatmapImageUrl: true,
  trajectoryData: true
});

// --- Types ---

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Request Types
export interface UploadVideoRequest {
  playerColor?: string;
  // File is handled via multipart/form-data
}

export type UpdateVideoRequest = Partial<typeof videos.$inferInsert>;

// Response Types
export type VideoResponse = Video;
export type VideoListResponse = Video[];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  country: text("country"),
  contactNumber: text("contact_number"),
  whatsAppNumber: text("whatsapp_number"),
  currentClub: text("current_club"),
  playerPosition: text("player_position"),
  state: text("state"),
  matchVideosCount: text("match_videos_count"),
  videoLink: text("video_link"),
  howFoundUs: text("how_found_us"),
  playerPhoto: text("player_photo"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  userType: text("user_type"), // 'player', 'coach', 'scout' — null means profile setup not complete
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

// Player Profile
export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dateOfBirth: text("date_of_birth"),
  height: integer("height"),
  weight: integer("weight"),
  preferredFoot: text("preferred_foot"), // 'right', 'left', 'both'
  previousClubs: text("previous_clubs"),
  teamLevel: text("team_level"), // 'street', 'school', 'local_club', 'academy', 'semi_professional', 'professional', 'top_division'
  yearsOfCompetitiveFootball: text("years_of_experience"),
  goals: integer("goals"),
  assists: integer("assists"),
  matchesPlayed: integer("matches_played"),
  lookingForClub: boolean("looking_for_club"),
  willingToRelocate: boolean("willing_to_relocate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coach Profile
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  age: integer("age"),
  coachingLicense: text("coaching_license"), // 'uefa_a', 'uefa_b', 'caf', 'fa', 'none'
  yearsOfCoaching: integer("years_of_coaching"),
  previousTeams: text("previous_teams"),
  coachingLevel: text("coaching_level"), // 'youth', 'professional', 'goalkeeper'
  trophiesWon: integer("trophies_won"),
  promotions: integer("promotions"),
  championships: integer("championships"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scout Profile
export const scoutProfiles = pgTable("scout_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organization: text("organization"),
  currentClubAgency: text("current_club_agency"),
  yearsOfScouting: integer("years_of_scouting"),
  scoutingRegions: text("scouting_regions"), // comma-separated
  ageGroupsFocus: text("age_groups_focus"), // comma-separated
  positionsFocus: text("positions_focus"), // comma-separated
  authorityLevel: text("authority_level"), // 'independent', 'club_scout', 'agency_scout'
  workEmail: text("work_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).omit({ id: true, lastSeen: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PlayerProfile = typeof playerProfiles.$inferSelect;
export const insertPlayerProfileSchema = createInsertSchema(playerProfiles).omit({ id: true, createdAt: true });
export type InsertPlayerProfile = z.infer<typeof insertPlayerProfileSchema>;

export type CoachProfile = typeof coachProfiles.$inferSelect;
export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({ id: true, createdAt: true });
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;

export type ScoutProfile = typeof scoutProfiles.$inferSelect;
export const insertScoutProfileSchema = createInsertSchema(scoutProfiles).omit({ id: true, createdAt: true });
export type InsertScoutProfile = z.infer<typeof insertScoutProfileSchema>;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
