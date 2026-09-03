import React, { useState, useEffect } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  ArrowRightIcon,
  HistoryIcon,
  LoaderIcon,
  Loader2Icon,
  TimerIcon,
  XIcon,
  Wand2Icon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/api";

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);

  // Scheduling state
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const fetchGenerations = async () => {
    try {
      const { data } = await api.get("/posts/generate");
      setGenerations(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load generations");
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you'd like to create.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/posts/generate", {
        prompt,
        tone,
        generateImage,
      });
      setGenerations((prev) => [data, ...prev]);
      setPrompt("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = scheduledDate === todayStr;
  const minTime = isToday ? new Date().toTimeString().slice(0, 5) : undefined;

  const handleSchedule = async () => {
    if (selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime) {
      toast.error("Please select at least one channel and a date/time.");
      return;
    }

    const scheduledForDate = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledForDate <= new Date()) {
      toast.error("Please choose a time in the future");
      return;
    }

    setScheduling(true);
    try {
      const formData = new FormData();
      formData.append("content", activeScheduler.content);
      formData.append("scheduledFor", scheduledForDate.toISOString());
      formData.append("platforms", JSON.stringify(selectedPlatforms));
      if (activeScheduler.mediaUrl) {
        formData.append("mediaUrl", activeScheduler.mediaUrl);
      }

      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Post scheduled successfully!");
      setActiveScheduler(null);
      setSelectedPlatforms([]);
      setScheduledDate("");
      setScheduledTime("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to schedule post");
    } finally {
      setScheduling(false);
    }
  };

  const tones = ["Professional", "Creative", "Funny", "Minimalist", "Excited"];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Input section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-4">
          What should we create today?
        </h1>

        <div className="space-y-3">
          <textarea
            placeholder="Share your idea"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-2.5"
            >
              <span className="text-sm font-medium text-slate-600">AI Image</span>
              <div
                className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 ${
                  generateImage ? "bg-red-500" : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    generateImage ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <button
              disabled={loading}
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tone === t
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI generated posts */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Recent Generations</h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {generations.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
          {generations.map((gen) => (
            <div
              key={gen._id}
              className="flex flex-col justify-between bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(gen.createdAt).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200">
                    {gen.tone}
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-3">{gen.content}</p>
                {gen.mediaUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={gen.mediaUrl} alt="Generated" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveScheduler(gen)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Schedule Post
              </button>
            </div>
          ))}

          {generations.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Wand2Icon className="size-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                No content generated yet. Try generating some content using AI.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduler modal */}
      {activeScheduler && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveScheduler(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Schedule Generation</h3>
              <button
                onClick={() => setActiveScheduler(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Prompt */}
              <div className="text-xs text-slate-400 italic">
                "{activeScheduler.prompt}"
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700">{activeScheduler.content}</p>
                {activeScheduler.mediaUrl && (
                  <img
                    src={activeScheduler.mediaUrl}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-lg mt-3"
                  />
                )}
              </div>

              {/* Channels */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Select Channels
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORMS.map((p) => {
                    const active = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSelectedPlatforms((prev) =>
                            prev.includes(p.id)
                              ? prev.filter((x) => x !== p.id)
                              : [...prev, p.id]
                          )
                        }
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

              {/* Date & time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Date</label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                    <CalendarIcon className="size-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      min={todayStr}
                      value={scheduledDate}
                      onChange={(e) => {
                        setScheduledDate(e.target.value);
                        setScheduledTime("");
                      }}
                      className="w-full text-sm text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Time</label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                    <ClockIcon className="size-4 text-slate-400 shrink-0" />
                    <input
                      type="time"
                      min={minTime}
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full text-sm text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="px-6 pb-6">
              <button
                onClick={handleSchedule}
                disabled={scheduling}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scheduling ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <TimerIcon className="size-4" />
                    Schedule Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIComposer;