import { pgTable, text, serial, integer, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  keyPasses: integer("key_passes"),
  performanceRating: doublePrecision("performance_rating"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  heatmapImageUrl: text("heatmap_image_url"),
  
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
  keyPasses: true,
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

// --- Shared Constants / Types for Frontend and Backend ---
export type JobStatus = "pending" | "processing" | "completed" | "failed";
