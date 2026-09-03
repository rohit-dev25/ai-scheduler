import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import Generation from "../models/Generation.js";
import Post from "../models/Post.js";

// Generate Post
// POST /api/posts/generate
export const generatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    if (!prompt?.trim()) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ message: "Gemini API key missing. Please add it to your server/.env file" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1. Generate text content
    const textInteraction = await ai.interactions.create({
      model: "gemini-3.7-flash",
      input: `Generate a ${tone} social media post about: ${prompt}. Keep it concise and include relevant hashtags.`,
    });

    const content = textInteraction.output_text;

    // 2. Optionally generate an image
   let mediaUrl: string | null = null;
   let mediaType: "image" | "video" | undefined;

    if (generateImage) {
      const imageInteraction = await ai.interactions.create({
        model: "gemini-2.5-flash-image",
        input: `Create a social media image for: ${prompt}`,
        response_format: {
          type: "image",
          aspect_ratio: "1:1",
          image_size: "1K",
        },
      });

      const generatedImage = imageInteraction.output_image;

      if (generatedImage?.data) {
        const mimeType = generatedImage.mime_type || "image/png";
        mediaUrl = `data:${mimeType};base64,${generatedImage.data}`;
        mediaType = "image";
      }
    }

    // 3. Save the generation to MongoDB
    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      tone,
      mediaUrl,
      mediaType,
    });

    res.status(201).json(generation);
  } catch (error: any) {
    console.error("generatePost error", error?.message || error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// GET Generations
// GET /api/posts/generate
export const getGenerations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(generations);
  } catch (error: any) {
    console.error("getGenerations error", error?.message || error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// GET Posts
// GET /api/posts
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ scheduledFor: -1 });
    res.json(posts);
  } catch (error: any) {
    console.error("getPosts error", error?.message || error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Schedule Post
// POST /api/posts
export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, scheduledFor } = req.body;
    const platforms = req.body.platforms ? JSON.parse(req.body.platforms) : [];

    if (!content?.trim()) {
      res.status(400).json({ message: "Content is required" });
      return;
    }

    if (!platforms || platforms.length === 0) {
      res.status(400).json({ message: "Select at least one platform" });
      return;
    }

    if (!scheduledFor) {
      res.status(400).json({ message: "Scheduled date/time is required" });
      return;
    }

    if (new Date(scheduledFor) <= new Date()) {
      res.status(400).json({ message: "Scheduled time must be in the future" });
      return;
    }

    let mediaUrl: string | undefined;
    let mediaType: "image" | "video" | undefined;

    if (req.file) {
      // TODO: upload req.file.buffer to Cloudinary here, then set mediaUrl/mediaType from the result
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      mediaUrl,
      mediaType,
      platforms,
      scheduledFor,
      status: "scheduled",
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error("schedulePost error", error?.message || error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};