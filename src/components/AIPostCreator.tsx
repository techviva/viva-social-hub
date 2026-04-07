"use client";

import { useState, useEffect } from "react";
import {
  SparklesIcon, XIcon, InstagramIcon, TikTokIcon, YouTubeIcon,
} from "./Icons";
import type { Platform } from "@/data/posts";

interface DrivePhoto {
  id: string;
  name: string;
  thumbnail: string;
  previewUrl: string;
}

interface AIPostCreatorProps {
  open: boolean;
  onClose: () => void;
}

const EDIT_STYLES = [
  { key: "gradient-overlay", name: "Gradient Premium", preview: "linear-gradient(135deg, #d4a843, #0a0a0f)" },
  { key: "bold-statement", name: "Bold Statement", preview: "linear-gradient(135deg, #ffffff, #0a0a0f)" },
  { key: "modern-minimal", name: "Minimal Clean", preview: "linear-gradient(135deg, #f0f0f0, #666)" },
  { key: "luxury-showcase", name: "Luxury Showcase", preview: "linear-gradient(135deg, #b8922e, #1a1a2e)" },
  { key: "engagement-question", name: "Engagement", preview: "linear-gradient(135deg, #22c55e, #0a0a0f)" },
  { key: "split-comparison", name: "Before/After", preview: "linear-gradient(135deg, #e1306c, #0a0a0f)" },
];

function PlatformIconSmall({ platform }: { platform: Platform }) {
  if (platform === "instagram") return <InstagramIcon className="w-3.5 h-3.5" />;
  if (platform === "tiktok") return <TikTokIcon className="w-3.5 h-3.5" />;
  return <YouTubeIcon className="w-3.5 h-3.5" />;
}

type Step = "prompt" | "generating" | "photo" | "editing" | "result";

export default function AIPostCreator({ open, onClose }: AIPostCreatorProps) {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");

  // AI-generated post data
  const [postData, setPostData] = useState<Record<string, string>>({});

  // Drive photos
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<DrivePhoto | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Edited image
  const [editedImage, setEditedImage] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [customEditPrompt, setCustomEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Dots animation
  useEffect(() => {
    if (step !== "generating" && !isEditing) return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [step, isEditing]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("prompt"); setPrompt(""); setError(""); setPostData({});
      setPhotos([]); setSelectedPhoto(null); setEditedImage("");
      setEditStyle(""); setCustomEditPrompt("");
    }
  }, [open]);

  // ── Step 1: Generate post with AI ──
  const generatePost = async () => {
    if (!prompt.trim()) return;
    setStep("generating"); setError("");

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), platform }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error generando"); setStep("prompt"); return; }

      setPostData(data.post);
      setEditStyle(data.post.editStyle || "gradient-overlay");

      // Auto-fetch photos from the suggested category
      const category = data.post.driveCategory || "best-of-viva";
      setLoadingPhotos(true);
      const photoRes = await fetch(`/api/drive-photos?limit=12&category=${category}`);
      const photoData = await photoRes.json();
      if (photoData.photos?.length) {
        setPhotos(photoData.photos);
        // Auto-select first photo
        setSelectedPhoto(photoData.photos[0]);
      }
      setLoadingPhotos(false);
      setStep("photo");
    } catch {
      setError("Error de conexion"); setStep("prompt");
    }
  };

  // ── Step 3: Edit image with Gemini ──
  const editImage = async (style?: string, customPrompt?: string) => {
    if (!selectedPhoto) return;
    setIsEditing(true); setError("");

    const useStyle = style || editStyle;
    const body: Record<string, string> = {
      imageUrl: selectedPhoto.previewUrl,
      style: useStyle,
      headline: postData.headline || "",
      subline: postData.subline || "",
      cta: postData.ctaText || "",
    };
    if (customPrompt) {
      body.prompt = customPrompt;
      delete body.style;
    }

    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.image) {
        setEditedImage(data.image);
        setStep("result");
      } else {
        setError(data.error || "No se pudo editar la imagen");
      }
    } catch {
      setError("Error editando imagen");
    }
    setIsEditing(false);
  };

  // ── Re-edit with custom prompt ──
  const reEdit = () => {
    if (customEditPrompt.trim()) {
      editImage(undefined, customEditPrompt.trim());
      setCustomEditPrompt("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-secondary)] shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--gold-primary)]/10"><SparklesIcon className="w-5 h-5 text-[var(--gold-light)]" /></div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Crear Publicacion con AI</h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                {step === "prompt" ? "Paso 1: Describe tu post" : step === "generating" ? "Generando..." : step === "photo" ? "Paso 2: Foto + Estilo" : step === "editing" ? "Editando..." : "Resultado final"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* ═══ STEP 1: PROMPT ═══ */}
          {step === "prompt" && (
            <>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder='Ej: "Before & after de un patio con pavers travertino" o "Promo de spring para turf sintetico"'
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none" />

              <div className="flex gap-1.5">
                {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 justify-center ${platform === p ? (p === "instagram" ? "badge-instagram" : p === "tiktok" ? "badge-tiktok" : "badge-youtube") : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                    <PlatformIconSmall platform={p} />{p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              <button onClick={generatePost} disabled={!prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--gold-primary)]/25 transition-all active:scale-[0.98]">
                <SparklesIcon className="w-4 h-4 inline mr-2" />Generar Publicacion
              </button>
            </>
          )}

          {/* ═══ STEP: GENERATING ═══ */}
          {step === "generating" && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-12 h-12 border-3 border-[var(--gold-primary)]/20 border-t-[var(--gold-primary)] rounded-full animate-spin" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">Generando publicacion premium{dots}</p>
              <p className="text-xs text-[var(--text-muted)]">AI esta creando copy + seleccionando foto de Drive</p>
            </div>
          )}

          {/* ═══ STEP 2: PHOTO SELECTION + STYLE ═══ */}
          {step === "photo" && (
            <>
              {/* Generated caption preview */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3">
                <p className="text-[10px] uppercase tracking-wider text-[var(--gold-light)] font-semibold mb-1">Caption generado</p>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-4 whitespace-pre-line">{postData.caption}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--gold-primary)]/10 text-[var(--gold-light)] border border-[var(--border-gold)]">{postData.headline}</span>
                </div>
              </div>

              {/* Photo grid */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">Foto seleccionada de Drive</p>
                {loadingPhotos ? (
                  <div className="flex items-center justify-center py-6"><span className="w-5 h-5 border-2 border-[var(--gold-primary)]/30 border-t-[var(--gold-primary)] rounded-full animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {photos.map((photo) => (
                      <button key={photo.id} onClick={() => setSelectedPhoto(photo)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedPhoto?.id === photo.id ? "border-[var(--gold-primary)] ring-2 ring-[var(--gold-primary)]/30 scale-105" : "border-[var(--border-color)]"}`}>
                        <img src={photo.thumbnail} alt={photo.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit style */}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">Estilo de edicion</p>
                <div className="grid grid-cols-3 gap-2">
                  {EDIT_STYLES.map((s) => (
                    <button key={s.key} onClick={() => setEditStyle(s.key)}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${editStyle === s.key ? "border-[var(--gold-primary)] shadow-lg shadow-[var(--gold-primary)]/15 scale-105" : "border-transparent hover:border-[var(--border-color)]"}`}>
                      <div className="h-10 rounded-t-lg" style={{ background: s.preview }} />
                      <p className="text-[9px] text-center py-1.5 text-[var(--text-muted)] font-medium bg-[var(--bg-primary)]">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => editImage()} disabled={!selectedPhoto || isEditing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--gold-primary)]/25 transition-all active:scale-[0.98]">
                {isEditing ? <><span className="w-4 h-4 border-2 border-[var(--bg-primary)]/30 border-t-[var(--bg-primary)] rounded-full animate-spin inline-block mr-2" />Editando con Gemini{dots}</> : <><SparklesIcon className="w-4 h-4 inline mr-2" />Editar Imagen con AI</>}
              </button>
            </>
          )}

          {/* ═══ STEP: RESULT ═══ */}
          {step === "result" && (
            <>
              {/* Edited image preview */}
              <div className="rounded-2xl overflow-hidden border border-[var(--border-gold)] shadow-lg shadow-[var(--gold-primary)]/10">
                <img src={editedImage} alt="Edited post" className="w-full aspect-square object-cover" />
              </div>

              {/* Caption */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3 space-y-2">
                <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed">{postData.caption}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{postData.hashtags}</p>
              </div>

              {/* Re-edit */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/30 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Re-editar imagen</p>
                <div className="flex gap-1.5">
                  <input type="text" value={customEditPrompt} onChange={(e) => setCustomEditPrompt(e.target.value)}
                    placeholder="Ej: make it warmer, add more contrast, change text to..."
                    onKeyDown={(e) => e.key === "Enter" && reEdit()}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)]" />
                  <button onClick={reEdit} disabled={!customEditPrompt.trim() || isEditing}
                    className="px-4 py-2 rounded-lg bg-[var(--gold-primary)] text-[var(--bg-primary)] text-xs font-semibold disabled:opacity-40 transition-all">
                    {isEditing ? dots : "Re-editar"}
                  </button>
                </div>
                {/* Quick style re-edits */}
                <div className="flex gap-1 flex-wrap">
                  {EDIT_STYLES.filter((s) => s.key !== editStyle).slice(0, 4).map((s) => (
                    <button key={s.key} onClick={() => { setEditStyle(s.key); editImage(s.key); }}
                      disabled={isEditing}
                      className="px-2 py-1 rounded-md text-[9px] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--gold-light)] disabled:opacity-40 transition-all">
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { setStep("photo"); setEditedImage(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                  Cambiar foto/estilo
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm transition-all active:scale-[0.98]">
                  Listo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
