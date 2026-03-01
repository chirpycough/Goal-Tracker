import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
