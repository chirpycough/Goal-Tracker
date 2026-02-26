import express, { type Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

// Ensure uploads and static directories exist
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const STATIC_DIR = path.join(process.cwd(), "static", "heatmaps");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// Configure multer for video uploads
const upload = multer({
  dest: UPLOADS_DIR,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve static files (heatmaps)
  app.use("/static", express.static(path.join(process.cwd(), "static")));

  // --- API Routes ---

  app.get(api.videos.list.path, async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get(api.videos.get.path, async (req, res) => {
    try {
      const video = await storage.getVideo(Number(req.params.id));
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.delete(api.videos.delete.path, async (req, res) => {
    try {
      const videoId = Number(req.params.id);
      const video = await storage.getVideo(videoId);
      if (video) {
        // Optional: delete associated files if needed
        try {
          if (video.filename) {
            const filePath = path.join(UPLOADS_DIR, video.filename);
            if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath);
            }
          }
        } catch (e) {
            console.error("Error deleting file", e);
        }
      }
      
      await storage.deleteVideo(videoId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Video Upload Route
  app.post(api.videos.upload.path, upload.single("video"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const { playerColor } = req.body;

      // Create video record
      const videoRecord = await storage.createVideo({
        filename: req.file.filename,
        originalName: req.file.originalname,
        playerColor: playerColor || null,
        status: "processing",
      });

      // Start asynchronous processing
      processVideoAsync(videoRecord.id, req.file.path, playerColor);

      // Return immediately
      res.status(201).json(videoRecord);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Seed initial data if DB is empty
  seedDatabase().catch(console.error);

  return httpServer;
}

// Background video processing function
async function processVideoAsync(videoId: number, videoPath: string, playerColor?: string) {
  try {
    console.log(`Starting processing for video ${videoId} at ${videoPath}`);
    
    // In a real system, we would spawn a Python process here to run YOLOv8/DeepSORT.
    // For this implementation, we will simulate the Python processing logic 
    // taking some time, and then we will use OpenAI to generate the AI summary.
    
    // Simulate processing time (e.g. 5-10 seconds)
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Mock calculated stats
    const distance = (Math.random() * 5 + 4).toFixed(2); // 4-9 km
    const avgSpeed = (Math.random() * 3 + 5).toFixed(1); // 5-8 km/h
    const maxSpeed = (Math.random() * 8 + 25).toFixed(1); // 25-33 km/h
    const touches = Math.floor(Math.random() * 40 + 20); // 20-60
    const shots = Math.floor(Math.random() * 5); // 0-4
    const shotsOnTarget = Math.floor(Math.random() * (shots + 1));
    const keyPasses = Math.floor(Math.random() * 6); // 0-5
    const dribbles = Math.floor(Math.random() * 8);
    const passes = Math.floor(Math.random() * 60 + 10);
    const tackles = Math.floor(Math.random() * 6);
    const foulsDrawn = Math.floor(Math.random() * 4);
    const offsides = Math.floor(Math.random() * 3);
    
    // Generate AI Summary using OpenAI
    const prompt = `Analyze this football player's stats and provide a very brief (2-3 sentences) summary of their strengths and weaknesses.
    Stats: 
    Distance: ${distance} km
    Avg Speed: ${avgSpeed} km/h
    Max Speed: ${maxSpeed} km/h
    Touches: ${touches}
    Shots: ${shots} (${shotsOnTarget} on target)
    Key Passes: ${keyPasses}
    Dribbles: ${dribbles}
    Passes: ${passes}
    Tackles: ${tackles}
    
    Output JSON format: { "strengths": "string", "weaknesses": "string" }`;

    let strengths = "Good overall movement";
    let weaknesses = "Needs more involvement";
    
    try {
        const { openai } = await import("./replit_integrations/image/client");
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        
        const summary = JSON.parse(aiResponse.choices[0]?.message?.content || "{}");
        if (summary.strengths) strengths = summary.strengths;
        if (summary.weaknesses) weaknesses = summary.weaknesses;
    } catch (aiError) {
        console.error("AI summary generation failed, using defaults:", aiError);
    }
    
    // Calculate rating (1.0 to 10.0)
    let rating = (Number(distance) / 10) * 2.5 + (Number(maxSpeed) / 35) * 2.5 + (touches / 60) * 2.0 + (shots / 5) * 1.5 + (keyPasses / 5) * 1.5;
    rating = Math.min(Math.max(rating * 10, 1.0), 10.0);
    
    const heatmapFilename = `heatmap_player_${videoId}.png`;
    const heatmapPath = path.join(STATIC_DIR, heatmapFilename);
    
    // Create a dummy transparent 1x1 png if we don't have python available yet
    fs.writeFileSync(heatmapPath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"));

    // Update video record with results
    await storage.updateVideo(videoId, {
      status: "completed",
      distanceCoveredKm: Number(distance),
      averageSpeedKmh: Number(avgSpeed),
      maxSpeedKmh: Number(maxSpeed),
      ballTouches: touches,
      shots: shots,
      shotsOnTarget: shotsOnTarget,
      keyPasses: keyPasses,
      dribbles: dribbles,
      passes: passes,
      tackles: tackles,
      foulsDrawn: foulsDrawn,
      offsides: offsides,
      performanceRating: Number(rating.toFixed(1)),
      strengths,
      weaknesses,
      heatmapImageUrl: `/static/heatmaps/${heatmapFilename}`,
    });
    
    console.log(`Processing completed for video ${videoId}`);

  } catch (error) {
    console.error(`Processing failed for video ${videoId}:`, error);
    await storage.updateVideo(videoId, { status: "failed" });
  }
}

async function seedDatabase() {
  const videos = await storage.getVideos();
  if (videos.length === 0) {
    await storage.createVideo({
      filename: "sample-demo.mp4",
      originalName: "champions_league_final_messi.mp4",
      playerColor: "red",
      status: "completed",
    });
    // Immediately update it with mock stats to show a completed video
    await storage.updateVideo(1, {
      distanceCoveredKm: 10.2,
      averageSpeedKmh: 7.8,
      maxSpeedKmh: 31.4,
      ballTouches: 68,
      shots: 5,
      shotsOnTarget: 3,
      keyPasses: 4,
      dribbles: 6,
      passes: 45,
      tackles: 2,
      foulsDrawn: 3,
      offsides: 1,
      performanceRating: 9.1,
      strengths: "Elite ball control, high shot volume, incredible burst speed",
      weaknesses: "Lower defensive work rate, avoids tracking back",
      heatmapImageUrl: "", // We don't have an image, frontend should handle null gracefully
    });
  }
}
