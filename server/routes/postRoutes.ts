import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { getPosts, schedulePost } from "../controllers/postController.js";
import { generatePost, getGenerations } from "../controllers/postController.js";

const router = express.Router();

// GET /api/posts - fetch all posts for logged-in user
router.get("/", protect, getPosts);

// POST /api/posts - schedule a new post (supports optional media upload)
router.post("/", protect, upload.single("media"), schedulePost);

// POST /api/posts/generate - generate AI content (text + optional image)
router.post("/generate", protect, generatePost);

// GET /api/posts/generate - fetch past AI generations
router.get("/generate", protect, getGenerations);

export default router;