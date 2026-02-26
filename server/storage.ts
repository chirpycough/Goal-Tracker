import { db } from "./db";
import { videos, type InsertVideo, type UpdateVideoRequest, type VideoResponse } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getVideos(): Promise<VideoResponse[]>;
  getVideo(id: number): Promise<VideoResponse | undefined>;
  createVideo(video: InsertVideo): Promise<VideoResponse>;
  updateVideo(id: number, updates: UpdateVideoRequest): Promise<VideoResponse>;
  deleteVideo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getVideos(): Promise<VideoResponse[]> {
    return await db.select().from(videos).orderBy(desc(videos.uploadDate));
  }

  async getVideo(id: number): Promise<VideoResponse | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<VideoResponse> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: number, updates: UpdateVideoRequest): Promise<VideoResponse> {
    const [updated] = await db.update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    return updated;
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }
}

export const storage = new DatabaseStorage();
