import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actionType: {
      type: String,
      enum: [
        "POST_PUBLISHED",
        "POST_SCHEDULED",
        "POST_FAILED",
        "ACCOUNT_CONNECTED",
        "ACCOUNT_DISCONNECTED",
        "AI_REPLY", // keep if you're planning this feature
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ActivityLog", activityLogSchema);
