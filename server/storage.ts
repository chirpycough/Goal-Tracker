import { db } from "./db";
import { videos, users, messages, posts, type InsertVideo, type UpdateVideoRequest, type VideoResponse, type User, type InsertUser, type Message, type InsertMessage, type Post, type InsertPost } from "@shared/schema";
import { eq, desc, and, or, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getVideos(): Promise<VideoResponse[]>;
  getVideo(id: number): Promise<VideoResponse | undefined>;
  createVideo(video: InsertVideo): Promise<VideoResponse>;
  updateVideo(id: number, updates: UpdateVideoRequest): Promise<VideoResponse>;
  deleteVideo(id: number): Promise<void>;
  
  // Auth methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(currentUserId?: number): Promise<(User & { unreadCount?: number })[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateLastSeen(id: number): Promise<void>;
  
  // Message methods
  getMessages(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Post methods
  getPosts(): Promise<(Post & { user: User })[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, content: string): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

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

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getUsers(currentUserId?: number): Promise<(User & { unreadCount?: number })[]> {
    const allUsers = await db.select().from(users);
    
    if (!currentUserId) return allUsers;

    const unreadCounts = await db
      .select({
        senderId: messages.senderId,
        count: db.$count(messages, and(eq(messages.receiverId, currentUserId), eq(messages.isRead, false)))
      })
      .from(messages)
      .where(eq(messages.receiverId, currentUserId))
      .groupBy(messages.senderId);

    return allUsers.map(user => ({
      ...user,
      unreadCount: unreadCounts.find(c => c.senderId === user.id)?.count || 0
    }));
  }

  async updateLastSeen(id: number): Promise<void> {
    await db.update(users)
      .set({ lastSeen: new Date() })
      .where(eq(users.id, id));
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    const msgs = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));
    
    // Mark as read if current user is receiver
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, userId2),
          eq(messages.receiverId, userId1),
          eq(messages.isRead, false)
        )
      );
      
    return msgs;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getPosts(): Promise<(Post & { user: User })[]> {
    const results = await db
      .select({
        post: posts,
        user: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.id));
    
    return results.map(r => ({ ...r.post, user: r.user }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, content: string): Promise<Post | undefined> {
    const [updated] = await db.update(posts)
      .set({ content })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
}

export const storage = new DatabaseStorage();
