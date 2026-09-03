
import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import ActivityLog from "../models/ActivityLog.js";

// Get recent activity for the logged-in user
// GET /api/activity
export const getActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activities = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedPost", "content platforms scheduledFor");

    res.json(activities);
  } catch (error: any) {
    console.error("getActivity error", error?.message || error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
};