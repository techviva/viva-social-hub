"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon, XIcon,
  CalendarIcon, ScriptIcon, ChevronLeftIcon, ChevronRightIcon,
} from "./Icons";
import { POST_TEMPLATES, getTemplateById, getRandomVariation, type PostTemplate, type StyleVariation } from "@/lib/post-templates";
import PostRenderer from "./PostRenderer";
import type { Platform } from "@/data/posts";

/* ── Types ── */

export interface DraftPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  image: string;
  platform: Platform;
  channelType: string;
  templateId: string;
  variation?: StyleVariation;
  createdAt: string;
  scheduledDate?: string;
}

interface GeneratedPost {
  postData: Record<string, string>;
  photoUrl: string;
  template: PostTemplate;
  variation: StyleVariation;
}

interface AIPostCreatorProps {
  open: boolean;
  onClose: () => void;
  onSaveDraft: (draft: DraftPost) => void;
  onSchedule: (draft: DraftPost) => void;
}

const DRAFTS_KEY = "viva-social-hub-drafts";

export function loadDrafts(): DraftPost[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]"); } catch { return []; }
}

export function saveDrafts(drafts: DraftPost[]) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts)); }
  catch { const t = [...drafts]; while (t.length > 0) { t.pop(); try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(t)); return; } catch { /* trim */ } } }
}

function compressImage(dataUrl: string, maxSize = 600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = maxSize; c.height = maxSize; c.getContext("2d")?.drawImage(img, 0, 0, maxSize, maxSize); resolve(c.toDataURL("image/jpeg", 0.7)); };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ── Platform config ── */

type ChannelGroup = "igfb" | "gbp" | "web";

const CHANNEL_GROUPS: { key: ChannelGroup; label: string; icon: string }[] = [
  { key: "igfb", label: "IG + FB", icon: "📱" },
  { key: "gbp", label: "GBP", icon: "📍" },
  { key: "web", label: "Web", icon: "🌐" },
];

const CHANNEL_TYPES: Record<ChannelGroup, { key: string; label: string }[]> = {
  igfb: [
    { key: "post", label: "Post" },
    { key: "story", label: "Story" },
    { key: "ad", label: "Ad" },
    { key: "reel", label: "Reel" },
  ],
  gbp: [
    { key: "gbp-image", label: "Image" },
    { key: "gbp-video", label: "Video" },
  ],
  web: [
    { key: "web-banner", label: "Banner" },
    { key: "web-blog", label: "Blog Post" },
  ],
};

type Step = "config" | "working" | "results" | "schedule";

interface DrivePhoto { id: string; name: string; thumbnail: string; previewUrl: string; }

export default function AIPostCreator({ open, onClose, onSaveDraft, onSchedule }: AIPostCreatorProps) {
  const [step, setStep] = useState<Step>("config");
  const [prompt, setPrompt] = useState("");
  const [channelGroup, setChannelGroup] = useState<ChannelGroup>("igfb");
  const [channelType, setChannelType] = useState("post");
  const [postCount, setPostCount] = useState(1);
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [progress, setProgress] = useState(0);

  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "working") return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [step]);

  useEffect(() => {
    if (open) {
      setStep("config"); setPrompt(""); setError(""); setGeneratedPosts([]);
      setActiveIndex(0); setShowFullscreen(false);
      setScheduleDate(""); setScheduleTime("12:00"); setProgress(0);
      setChannelGroup("igfb"); setChannelType("post"); setPostCount(1);
    }
  }, [open]);

  useEffect(() => { setChannelType(CHANNEL_TYPES[channelGroup][0].key); }, [channelGroup]);

  const activePost = generatedPosts[activeIndex];

  const parsePrompts = (): string[] => {
    const lines = prompt.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.length > 1 ? lines : Array.from({ length: postCount }, () => lines[0] || prompt.trim());
  };

  const totalToGenerate = () => {
    const lines = prompt.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return lines.length > 1 ? lines.length : postCount;
  };

  // ── Generate ──
  const generate = async () => {
    if (!prompt.trim()) return;
    setStep("working"); setError(""); setGeneratedPosts([]); setProgress(0);

    const prompts = parsePrompts();
    const total = prompts.length;
    const results: GeneratedPost[] = [];

    for (let i = 0; i < total; i++) {
      try {
        setStatusMsg(`Generating creative ${i + 1} of ${total}...`);
        setProgress(((i) / total) * 100);

        const postRes = await fetch("/api/generate-post", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompts[i], platform: channelGroup, channelType, batchIndex: i, batchTotal: total }),
        });
        const postJson = await postRes.json();
        if (!postRes.ok) { setError(postJson.error || `Error on creative ${i + 1}`); continue; }

        setStatusMsg(`Finding photo ${i + 1} of ${total}...`);
        const category = postJson.post.driveCategory || "best-of-viva";
        const driveRes = await fetch(`/api/drive-photos?limit=8&category=${category}`);
        const driveJson = await driveRes.json();
        let photoUrl = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=800&fit=crop";
        if (driveJson.photos?.length) { photoUrl = driveJson.photos[i % driveJson.photos.length].previewUrl; }

        let editedPhotoUrl = photoUrl;
        if (postJson.post.geminiPrompt) {
          setStatusMsg(`Editing photo ${i + 1} with AI...`);
          try {
            const editRes = await fetch("/api/edit-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: photoUrl, prompt: postJson.post.geminiPrompt }) });
            const editJson = await editRes.json();
            if (editJson.image) editedPhotoUrl = editJson.image;
          } catch { /* fallback to original */ }
        }

        const tpl = getTemplateById(postJson.post.templateId) || POST_TEMPLATES[i % POST_TEMPLATES.length];
        const variation = postJson.post.variation || getRandomVariation();

        results.push({ postData: postJson.post, photoUrl: editedPhotoUrl, template: tpl, variation });
        setProgress(((i + 1) / total) * 100);
      } catch { setError(`Error on creative ${i + 1}`); }
    }

    if (results.length > 0) { setGeneratedPosts(results); setActiveIndex(0); setStep("results"); }
    else { setStep("config"); }
  };

  // ── Draft building ──
  const buildDraft = useCallback((): DraftPost => {
    const gp = generatedPosts[activeIndex];
    return {
      id: `draft-${Date.now()}-${activeIndex}`,
      title: gp.postData.title || prompt.substring(0, 50),
      caption: gp.postData.caption || "",
      hashtags: gp.postData.hashtags || "",
      headline: gp.postData.headline || "",
      subline: gp.postData.subline,
      ctaText: gp.postData.ctaText,
      image: gp.photoUrl,
      platform: channelGroup as Platform,
      channelType,
      templateId: gp.template.id,
      variation: gp.variation,
      createdAt: new Date().toISOString(),
    };
  }, [generatedPosts, activeIndex, prompt, channelGroup, channelType]);

  const handleSaveDraft = async () => {
    const draft = buildDraft();
    if (draft.image.startsWith("data:")) draft.image = await compressImage(draft.image);
    onSaveDraft(draft);
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < generatedPosts.length; i++) {
      const gp = generatedPosts[i];
      let img = gp.photoUrl;
      if (img.startsWith("data:")) img = await compressImage(img);
      onSaveDraft({
        id: `draft-${Date.now()}-${i}`, title: gp.postData.title || prompt.substring(0, 50),
        caption: gp.postData.caption || "", hashtags: gp.postData.hashtags || "",
        headline: gp.postData.headline || "", subline: gp.postData.subline, ctaText: gp.postData.ctaText,
        image: img, platform: channelGroup as Platform, channelType,
        templateId: gp.template.id, variation: gp.variation, createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const handleSchedule = () => {
    if (!scheduleDate) { setError("Select a date"); return; }
    const draft = buildDraft();
    draft.scheduledDate = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    onSchedule(draft); onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} />

      {showFullscreen && activePost && (
        <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center animate-overlay-in" onClick={() => setShowFullscreen(false)}>
          <button onClick={() => setShowFullscreen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"><XIcon className="w-6 h-6" /></button>
          <div className="w-full max-w-[min(90vw,90vh)] aspect-square">
            <img src={activePost.photoUrl} alt="" className="w-full h-full object-contain rounded-xl" />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-secondary)] shadow-2xl animate-fade-up">

        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-leaf)]/10"><SparklesIcon className="w-5 h-5 text-[var(--viva-green-bright)]" /></div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Create with AI</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><XIcon className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* ═══ CONFIG ═══ */}
          {step === "config" && (
            <>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Describe your content</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder={"One idea per line = one creative each:\n\nEx:\nBefore & after travertine pavers in Scottsdale\nSpring promo 15% off artificial turf\n5 reasons to choose aluminum pergola\nClient testimonial: Rodriguez family patio"}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-leaf)] focus:ring-1 focus:ring-[var(--accent-leaf)]/30 transition-all resize-none" />
                {prompt.split("\n").filter((l) => l.trim()).length > 1 && (
                  <p className="text-[10px] text-[var(--viva-green-bright)] mt-1.5 flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3" />
                    {prompt.split("\n").filter((l) => l.trim()).length} ideas detected — one creative per line
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Platform</label>
                <div className="flex gap-1.5">
                  {CHANNEL_GROUPS.map((g) => (
                    <button key={g.key} onClick={() => setChannelGroup(g.key)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex-1 justify-center ${channelGroup === g.key ? "bg-[var(--accent-leaf)]/15 text-[var(--viva-green-bright)] border border-[var(--border-accent)]" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                      <span className="text-sm">{g.icon}</span>{g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Content Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {CHANNEL_TYPES[channelGroup].map((ct) => (
                    <button key={ct.key} onClick={() => setChannelType(ct.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${channelType === ct.key ? "bg-[var(--viva-green)]/30 text-[var(--viva-green-bright)] border border-[var(--border-accent)]" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-accent)]"}`}>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {prompt.split("\n").filter((l) => l.trim()).length <= 1 && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Variations: {postCount}</label>
                  <input type="range" min={1} max={10} value={postCount} onChange={(e) => setPostCount(Number(e.target.value))} className="w-full accent-[var(--accent-leaf)]" />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>1</span><span>5</span><span>10</span></div>
                </div>
              )}

              <button onClick={generate} disabled={!prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--accent-leaf)]/25 transition-all active:scale-[0.98]">
                <SparklesIcon className="w-4 h-4 inline mr-2" />
                {(() => { const n = totalToGenerate(); return n > 1 ? `Generate ${n} Creatives` : "Generate Creative"; })()}
              </button>
            </>
          )}

          {/* ═══ WORKING ═══ */}
          {step === "working" && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="relative"><div className="w-16 h-16 border-4 border-[var(--accent-leaf)]/20 border-t-[var(--accent-leaf)] rounded-full animate-spin" /><SparklesIcon className="w-6 h-6 text-[var(--viva-green-bright)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
              <p className="text-sm text-[var(--text-primary)] font-semibold">{statusMsg}{dots}</p>
              <div className="w-full max-w-xs h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent-leaf)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{Math.round(progress)}%</p>
            </div>
          )}

          {/* ═══ RESULTS ═══ */}
          {step === "results" && activePost && (
            <>
              {generatedPosts.length > 1 && (
                <div className="flex items-center justify-between">
                  <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-20 transition-all"><ChevronLeftIcon className="w-5 h-5" /></button>
                  <div className="flex gap-1.5">
                    {generatedPosts.map((_, i) => (
                      <button key={i} onClick={() => setActiveIndex(i)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${activeIndex === i ? "bg-[var(--accent-leaf)] text-[var(--bg-primary)]" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setActiveIndex(Math.min(generatedPosts.length - 1, activeIndex + 1))} disabled={activeIndex === generatedPosts.length - 1}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-20 transition-all"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
              )}

              <div ref={renderRef} className="rounded-2xl overflow-hidden border border-[var(--border-accent)] shadow-lg shadow-[var(--accent-leaf)]/10 cursor-pointer relative" onClick={() => setShowFullscreen(true)}>
                <img src={activePost.photoUrl} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-md text-[9px] text-white/70 pointer-events-none z-20">Expand</div>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--viva-green-bright)] font-semibold">Caption</p>
                  <span className="text-[9px] text-[var(--text-muted)]">{channelGroup.toUpperCase()} · {channelType}</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">{activePost.postData.caption}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{activePost.postData.hashtags}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSaveDraft}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--viva-green-bright)] hover:border-[var(--border-accent)] transition-all">
                  <ScriptIcon className="w-4 h-4" />Draft
                </button>
                <button onClick={() => setStep("schedule")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-semibold text-sm transition-all active:scale-[0.98]">
                  <CalendarIcon className="w-4 h-4" />Schedule
                </button>
              </div>

              {generatedPosts.length > 1 && (
                <button onClick={handleSaveAll}
                  className="w-full py-2 rounded-xl border border-[var(--border-accent)] text-xs text-[var(--viva-green-bright)] hover:bg-[var(--accent-leaf)]/5 transition-all">
                  Save all {generatedPosts.length} as drafts
                </button>
              )}

              <button onClick={() => { setStep("config"); setGeneratedPosts([]); }} className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">Start over</button>
            </>
          )}

          {/* ═══ SCHEDULE ═══ */}
          {step === "schedule" && activePost && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-accent)]">
                  <img src={activePost.photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{activePost.postData.headline || activePost.postData.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{channelGroup.toUpperCase()} · {channelType}</p>
                </div>
              </div>
              <div><label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Date</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)] [color-scheme:dark]" /></div>
              <div><label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Time</label>
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)] [color-scheme:dark]" /></div>
              <div className="flex gap-2">
                <button onClick={() => setStep("results")} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] transition-all">Back</button>
                <button onClick={handleSchedule} disabled={!scheduleDate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.98]">Schedule</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
