import React, { useState, useEffect } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  XIcon,
  CalendarIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";

const Scheduler = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/posts");
      setPosts(data);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.message || err.message || "Failed to fetch posts",
      );
    }
  };

  useEffect(() => {
    (async () => await fetchPosts())();
    const interval = setInterval(async () => await fetchPosts(), 1000);
    return () => clearInterval(interval);
  }, []);

  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = scheduledDate === todayStr;
  const minTime = isToday ? new Date().toTimeString().slice(0, 5) : undefined;

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one Platform");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Select Date and Time");
      return;
    }
    if (!selectedPlatforms.includes("instagram") && !mediaFile) {
      toast.error("Instagram requires an image or video");
      return;
    }

    const scheduledForDate = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledForDate <= new Date()) {
      toast.error("Please choose a time in the future");
      return;
    }

    const scheduledFor = scheduledForDate.toISOString();

    const formData = new FormData();
    formData.append("content", content);
    formData.append("scheduledFor", scheduledFor);
    formData.append("platforms", JSON.stringify(selectedPlatforms));
    if (mediaFile) formData.append("media", mediaFile);
    setLoading(true);

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Post Scheduled Successfully!");
      setContent("");
      setScheduledDate("");
      setScheduledTime("");
      setSelectedPlatforms([]);
      setMediaFile(null);
      await fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to Schedule Post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Compose panel */}
      <div className="lg:w-[420px] shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            Compose Post
          </h2>

          <form className="space-y-5" onSubmit={handleSchedule}>
            {/* Platforms */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Platforms
              </label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`size-10 rounded-lg border flex items-center justify-center transition-colors ${
                        active
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <p.icon className="size-4.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Content
              </label>
              <textarea
                required
                rows={5}
                placeholder="What do you want to share today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
              />
              <div
                className={`text-xs mt-1 text-right ${
                  content.length > 270 ? "text-red-500" : "text-slate-400"
                }`}
              >
                {content.length}/280
              </div>
            </div>

            {/* Media upload */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Media (optional)
              </label>
              {mediaFile ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  {mediaFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(mediaFile)}
                      alt="preview"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(mediaFile)}
                      controls
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaFile(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors">
                  <span>Click to upload image or video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && setMediaFile(e.target.files[0])
                    }
                  />
                </label>
              )}
            </div>

            {/* Date & time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Date
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                  <CalendarIcon className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    className="w-full text-sm text-slate-700 focus:outline-none"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      setScheduledTime("");
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Time
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                  <CalendarIcon className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="time"
                    required
                    min={minTime}
                    className="w-full text-sm text-slate-700 focus:outline-none"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  Schedule Post
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Queue panels */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <CalendarDaysIcon className="size-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Upcoming</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full ml-auto">
              {scheduled.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {scheduled.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No posts scheduled yet
              </div>
            ) : (
              scheduled.map((post) => (
                <div
                  key={post._id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {post.platforms.map((platformId: string) => {
                          const meta = PLATFORMS.find(
                            (p) => p.id === platformId,
                          );
                          return meta ? (
                            <meta.icon
                              key={platformId}
                              className="size-3.5 text-slate-400"
                            />
                          ) : null;
                        })}
                      </div>
                      {post.mediaType && (
                        <span className="text-xs text-slate-400 capitalize">
                          {post.mediaType}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(post.scheduledFor).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <CheckCircleIcon className="size-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Published</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full ml-auto">
              {published.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {published.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Nothing published yet
              </div>
            ) : (
              published.map((post) => (
                <div
                  key={post._id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        {post.platforms.map((platformId: string) => {
                          const meta = PLATFORMS.find(
                            (p) => p.id === platformId,
                          );
                          return meta ? (
                            <meta.icon
                              key={platformId}
                              className="size-3.5 text-slate-400"
                            />
                          ) : null;
                        })}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(post.scheduledFor).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Published badge */}
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                    <CheckCircleIcon className="size-3" />
                    Published
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;