"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon, XIcon, InstagramIcon, TikTokIcon, YouTubeIcon,
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
  templateId: string;
  variation?: import("@/lib/post-templates").StyleVariation;
  createdAt: string;
  scheduledDate?: string;
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

function PlatformIconSmall({ platform }: { platform: Platform }) {
  if (platform === "instagram") return <InstagramIcon className="w-3.5 h-3.5" />;
  if (platform === "tiktok") return <TikTokIcon className="w-3.5 h-3.5" />;
  return <YouTubeIcon className="w-3.5 h-3.5" />;
}

function compressImage(dataUrl: string, maxSize = 600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = maxSize; c.height = maxSize; c.getContext("2d")?.drawImage(img, 0, 0, maxSize, maxSize); resolve(c.toDataURL("image/jpeg", 0.7)); };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

type Step = "config" | "working" | "result" | "schedule";

interface DrivePhoto { id: string; name: string; thumbnail: string; previewUrl: string; }

export default function AIPostCreator({ open, onClose, onSaveDraft, onSchedule }: AIPostCreatorProps) {
  const [step, setStep] = useState<Step>("config");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Result data
  const [postData, setPostData] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<PostTemplate>(POST_TEMPLATES[0]);
  const [activeVariation, setActiveVariation] = useState<StyleVariation>(getRandomVariation());
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Editable text
  const [editHeadline, setEditHeadline] = useState("");
  const [editSubline, setEditSubline] = useState("");
  const [editCta, setEditCta] = useState("");
  const [showTextEdit, setShowTextEdit] = useState(false);

  // Schedule
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("12:00");

  // Render ref for screenshot
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "working") return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [step]);

  useEffect(() => {
    if (open) {
      setStep("config"); setPrompt(""); setError(""); setPostData({});
      setPhotoUrl(""); setActiveTemplate(POST_TEMPLATES[0]);
      setShowTextEdit(false); setShowFullscreen(false);
      setScheduleDate(""); setScheduleTime("12:00");
    }
  }, [open]);

  // ── Generate ──
  const generate = async () => {
    if (!prompt.trim()) return;
    setStep("working"); setError("");

    try {
      // 1. Claude generates copy + picks template + drive category
      setStatusMsg("Generando copy con Claude...");
      const postRes = await fetch("/api/generate-post", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), platform }),
      });
      const postJson = await postRes.json();
      if (!postRes.ok) { setError(postJson.error || "Error generando"); setStep("config"); return; }
      setPostData(postJson.post);
      setEditHeadline(postJson.post.headline || "");
      setEditSubline(postJson.post.subline || "");
      setEditCta(postJson.post.ctaText || "");

      // Set template + variation from AI
      const tpl = getTemplateById(postJson.post.templateId) || POST_TEMPLATES[0];
      setActiveTemplate(tpl);
      if (postJson.post.variation) {
        setActiveVariation(postJson.post.variation);
      } else {
        setActiveVariation(getRandomVariation(postJson.post.accentColor));
      }

      // 2. Get photo from Drive
      setStatusMsg("Seleccionando foto de Drive...");
      const category = postJson.post.driveCategory || "best-of-viva";
      const driveRes = await fetch(`/api/drive-photos?limit=5&category=${category}`);
      const driveJson = await driveRes.json();
      if (driveJson.photos?.length) {
        const idx = Math.floor(Math.random() * Math.min(3, driveJson.photos.length));
        setPhotoUrl(driveJson.photos[idx].previewUrl);
      } else {
        // Fallback
        setPhotoUrl("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=800&fit=crop");
      }

      setStep("result");
    } catch { setError("Error de conexion"); setStep("config"); }
  };

  // ── Build draft ──
  const buildDraft = useCallback(async (): Promise<DraftPost> => {
    // Capture the rendered post as image via canvas
    let imageData = photoUrl;
    if (renderRef.current) {
      try {
        // Use html2canvas-like approach: just save the photo URL (templates are CSS)
        // For localStorage we just store the photo URL + template ID
        imageData = photoUrl;
      } catch { /* fallback */ }
    }

    return {
      id: `draft-${Date.now()}`,
      title: postData.title || prompt.substring(0, 50),
      caption: postData.caption || "",
      hashtags: postData.hashtags || "",
      headline: editHeadline,
      subline: editSubline,
      ctaText: editCta,
      image: imageData,
      platform,
      templateId: activeTemplate.id,
      variation: activeVariation,
      createdAt: new Date().toISOString(),
      scheduledDate: scheduleDate && scheduleTime ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString() : undefined,
    };
  }, [postData, prompt, editHeadline, editSubline, editCta, photoUrl, platform, activeTemplate, scheduleDate, scheduleTime]);

  const handleSaveDraft = async () => {
    try { const draft = await buildDraft(); onSaveDraft(draft); onClose(); }
    catch { setError("Error guardando"); }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) { setError("Selecciona fecha"); return; }
    try { const draft = await buildDraft(); draft.scheduledDate = new Date(`${scheduleDate}T${scheduleTime}`).toISOString(); onSchedule(draft); onClose(); }
    catch { setError("Error programando"); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} />

      {/* Fullscreen preview */}
      {showFullscreen && photoUrl && (
        <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center animate-overlay-in" onClick={() => setShowFullscreen(false)}>
          <button onClick={() => setShowFullscreen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"><XIcon className="w-6 h-6" /></button>
          <div className="w-full max-w-[min(90vw,90vh)] aspect-square">
            <PostRenderer template={activeTemplate} variation={activeVariation} imageUrl={photoUrl} headline={editHeadline} subline={editSubline} cta={editCta} className="rounded-xl w-full" />
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-secondary)] shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-leaf)]/10"><SparklesIcon className="w-5 h-5 text-[var(--viva-green-bright)]" /></div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Crear con AI</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><XIcon className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* ═══ CONFIG ═══ */}
          {step === "config" && (
            <>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Describe tu post</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Ej: "Before & after de pavers travertino" o "Promo spring 15% off turf"' rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-leaf)] focus:ring-1 focus:ring-[var(--accent-leaf)]/30 transition-all resize-none" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Plataforma</label>
                <div className="flex gap-1.5">
                  {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                    <button key={p} onClick={() => setPlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 justify-center ${platform === p ? (p === "instagram" ? "badge-instagram" : p === "tiktok" ? "badge-tiktok" : "badge-youtube") : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                      <PlatformIconSmall platform={p} />{p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={generate} disabled={!prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--accent-leaf)]/25 transition-all active:scale-[0.98]">
                <SparklesIcon className="w-4 h-4 inline mr-2" />Generar Post
              </button>
            </>
          )}

          {/* ═══ WORKING ═══ */}
          {step === "working" && (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="relative"><div className="w-16 h-16 border-4 border-[var(--accent-leaf)]/20 border-t-[var(--accent-leaf)] rounded-full animate-spin" /><SparklesIcon className="w-6 h-6 text-[var(--viva-green-bright)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
              <p className="text-sm text-[var(--text-primary)] font-semibold">{statusMsg}{dots}</p>
            </div>
          )}

          {/* ═══ RESULT ═══ */}
          {step === "result" && (
            <>
              {/* Rendered post preview */}
              <div ref={renderRef} className="rounded-2xl overflow-hidden border border-[var(--border-accent)] shadow-lg shadow-[var(--accent-leaf)]/10 cursor-pointer" onClick={() => setShowFullscreen(true)}>
                <PostRenderer template={activeTemplate} variation={activeVariation} imageUrl={photoUrl} headline={editHeadline} subline={editSubline} cta={editCta} />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-md text-[9px] text-white/70 pointer-events-none z-20">Toca para ampliar</div>
              </div>

              {/* Template switcher */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">Cambiar estilo</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {POST_TEMPLATES.map((tpl) => (
                    <button key={tpl.id} onClick={() => { setActiveTemplate(tpl); setActiveVariation(getRandomVariation(activeVariation.accentColor)); }}
                      className={`flex-shrink-0 w-12 rounded-lg overflow-hidden border-2 transition-all ${activeTemplate.id === tpl.id ? "border-[var(--accent-leaf)] scale-110" : "border-transparent opacity-50 hover:opacity-80"}`}>
                      <div className="h-6" style={{ background: tpl.preview }} />
                      <p className="text-[6px] text-center py-0.5 bg-[var(--bg-primary)] text-[var(--text-muted)] truncate px-0.5">{tpl.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit text */}
              <div>
                <button onClick={() => setShowTextEdit(!showTextEdit)} className="text-[10px] text-[var(--viva-green-bright)] hover:underline mb-2">
                  {showTextEdit ? "Ocultar editor de texto" : "Editar textos"}
                </button>
                {showTextEdit && (
                  <div className="space-y-2 animate-fade-up">
                    <input type="text" value={editHeadline} onChange={(e) => setEditHeadline(e.target.value)} placeholder="Headline"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)]" />
                    <input type="text" value={editSubline} onChange={(e) => setEditSubline(e.target.value)} placeholder="Subline"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)]" />
                    <input type="text" value={editCta} onChange={(e) => setEditCta(e.target.value)} placeholder="CTA"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)]" />
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-[var(--viva-green-bright)] font-semibold">Caption</p>
                <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">{postData.caption}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{postData.hashtags}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleSaveDraft}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--viva-green-bright)] hover:border-[var(--border-accent)] transition-all">
                  <ScriptIcon className="w-4 h-4" />Borrador
                </button>
                <button onClick={() => setStep("schedule")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-semibold text-sm transition-all active:scale-[0.98]">
                  <CalendarIcon className="w-4 h-4" />Programar
                </button>
              </div>
              <button onClick={() => { setStep("config"); setPhotoUrl(""); }} className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">Empezar de nuevo</button>
            </>
          )}

          {/* ═══ SCHEDULE ═══ */}
          {step === "schedule" && (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-accent)]">
                  <PostRenderer template={activeTemplate} variation={activeVariation} imageUrl={photoUrl} headline={editHeadline} subline={editSubline} cta={editCta} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{editHeadline}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{activeTemplate.name}</p>
                </div>
              </div>
              <div><label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Fecha</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)] [color-scheme:dark]" /></div>
              <div><label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Hora</label>
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-leaf)] [color-scheme:dark]" /></div>
              <div className="flex gap-2">
                <button onClick={() => setStep("result")} className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] transition-all">Atras</button>
                <button onClick={handleSchedule} disabled={!scheduleDate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.98]">
                  <CalendarIcon className="w-4 h-4 inline mr-1.5" />Programar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
