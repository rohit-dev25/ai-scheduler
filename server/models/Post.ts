import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    platforms: [
      {
        type: String,
        enum: [
          "twitter",
          "linkedin",
          "facebook",
          "instagram",
          "threads",
          "facebook_page",
          "linkedin_page",
          "instagram_business",
        ],
      },
    ],

    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "published", "failed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);