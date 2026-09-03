import Post from "../models/Post.js";
import Account from "../models/Account.js";
import ActivityLog from "../models/ActivityLog.js";
import zernio from "../config/zernio.js";

export const processScheduledPosts = async (): Promise<void> => {
  try {
    const now = new Date();

    const duePosts = await Post.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
    });

    if (duePosts.length === 0) return;

    console.log(`Processing ${duePosts.length} due post(s)...`);

    for (const post of duePosts) {
      try {
        const platformEntries = [];

        for (const platform of post.platforms) {
          const account = await Account.findOne({
            user: post.user,
            platform,
            status: "connected",
          });

          if (!account?.zernioAccountId) {
            console.warn(`No connected ${platform} account for user ${post.user}, skipping`);
            continue;
          }

          platformEntries.push({ platform, accountId: account.zernioAccountId });
        }

        if (platformEntries.length === 0) {
          throw new Error("No connected accounts found for any selected platform");
        }

        const result = await zernio.posts.createPost({
          body: {
            content: post.content,
            mediaUrl: post.mediaUrl,
            publishNow: true,
            platforms: platformEntries,
          } as any,
        });

        console.log("Zernio response:", JSON.stringify(result, null, 2));

        post.status = "published";
        await post.save();

        await ActivityLog.create({
          user: post.user,
          actionType: "POST_PUBLISHED",
          description: `Published post to ${post.platforms.join(", ")}`,
          relatedPost: post._id,
        });

        console.log(`Post ${post._id} published successfully`);
      } catch (error: any) {
        console.error(`Failed to publish post ${post._id}:`, error?.response?.data || error?.message || error);

        post.status = "failed";
        await post.save();

        await ActivityLog.create({
          user: post.user,
          actionType: "POST_FAILED",
          description: `Failed to publish post to ${post.platforms.join(", ")}`,
          relatedPost: post._id,
        });
      }
    }
  } catch (error: any) {
    console.error("processScheduledPosts error:", error?.message || error);
  }
};