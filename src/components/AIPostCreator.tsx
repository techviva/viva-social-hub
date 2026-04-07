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
  { key: "luxury-showcase", name: "Luxury", preview: "linear-gradient(135deg, #b8922e, #1a1a2e)" },
  { key: "engagement-question", name: "Engagement", preview: "linear-gradient(135deg, #22c55e, #0a0a0f)" },
  { key: "split-comparison", name: "Before/After", preview: "linear-gradient(135deg, #e1306c, #0a0a0f)" },
];

function PlatformIconSmall({ platform }: { platform: Platform }) {
  if (platform === "instagram") return <InstagramIcon className="w-3.5 h-3.5" />;
  if (platform === "tiktok") return <TikTokIcon className="w-3.5 h-3.5" />;
  return <YouTubeIcon className="w-3.5 h-3.5" />;
}

type Step = "config" | "working" | "result";

export default function AIPostCreator({ open, onClose }: AIPostCreatorProps) {
  const [step, setStep] = useState<Step>("config");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [editStyle, setEditStyle] = useState("gradient-overlay");
  const [photoMode, setPhotoMode] = useState<"auto" | "choose">("auto");
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Photo choosing (only in "choose" mode)
  const [photoOptions, setPhotoOptions] = useState<DrivePhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<DrivePhoto | null>(null);
  const [photosLoaded, setPhotosLoaded] = useState(false);

  // Result
  const [postData, setPostData] = useState<Record<string, string>>({});
  const [editedImage, setEditedImage] = useState("");
  const [isReEditing, setIsReEditing] = useState(false);
  const [reEditPrompt, setReEditPrompt] = useState("");

  useEffect(() => {
    if (step !== "working" && !isReEditing) return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [step, isReEditing]);

  useEffect(() => {
    if (open) {
      setStep("config"); setPrompt(""); setError(""); setPostData({});
      setPhotoOptions([]); setSelectedPhoto(null); setPhotosLoaded(false);
      setEditedImage(""); setReEditPrompt(""); setStatusMsg("");
      setPhotoMode("auto"); setEditStyle("gradient-overlay");
    }
  }, [open]);

  // Load photo options when user switches to "choose" mode
  const loadPhotoOptions = async (category?: string) => {
    setPhotosLoaded(false);
    try {
      const cat = category || "best-of-viva";
      const res = await fetch(`/api/drive-photos?limit=6&category=${cat}`);
      const data = await res.json();
      if (data.photos?.length) {
        setPhotoOptions(data.photos);
        setSelectedPhoto(data.photos[0]);
      }
      setPhotosLoaded(true);
    } catch { setPhotosLoaded(true); }
  };

  // ── Main generation flow ──
  const generate = async () => {
    if (!prompt.trim()) return;

    // In "choose" mode, must have selected a photo first
    if (photoMode === "choose" && !selectedPhoto) {
      setError("Selecciona una foto primero");
      return;
    }

    setStep("working"); setError("");

    try {
      // Step 1: Generate post copy with Claude
      setStatusMsg("Generando copy con AI...");
      const postRes = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), platform }),
      });
      const postJson = await postRes.json();
      if (!postRes.ok) { setError(postJson.error || "Error generando copy"); setStep("config"); return; }
      setPostData(postJson.post);

      // Step 2: Get photo from Drive
      let photoUrl = "";
      if (photoMode === "choose" && selectedPhoto) {
        photoUrl = selectedPhoto.previewUrl;
      } else {
        setStatusMsg("Buscando foto en Drive...");
        const category = postJson.post.driveCategory || "best-of-viva";
        const driveRes = await fetch(`/api/drive-photos?limit=3&category=${category}`);
        const driveJson = await driveRes.json();
        if (driveJson.photos?.length) {
          // Pick random from top 3
          const idx = Math.floor(Math.random() * Math.min(3, driveJson.photos.length));
          photoUrl = driveJson.photos[idx].previewUrl;
        }
      }

      // Step 3: Edit image with Gemini
      setStatusMsg("Editando imagen con Gemini...");
      const editRes = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: photoUrl,
          style: editStyle,
          headline: postJson.post.headline || "",
          subline: postJson.post.subline || "",
          cta: postJson.post.ctaText || "",
        }),
      });
      const editJson = await editRes.json();
      if (editJson.image) {
        setEditedImage(editJson.image);
        setStep("result");
      } else {
        setError(editJson.error || "Error editando imagen");
        setStep("config");
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
      setStep("config");
    }
  };

  // ── Re-edit ──
  const reEdit = async (styleOverride?: string, customPrompt?: string) => {
    setIsReEditing(true); setError("");
    const body: Record<string, string> = {};

    if (customPrompt) {
      body.prompt = customPrompt;
    } else {
      body.style = styleOverride || editStyle;
      body.headline = postData.headline || "";
      body.subline = postData.subline || "";
      body.cta = postData.ctaText || "";
    }

    // Use the current edited image as reference for re-edits
    if (editedImage) body.imageUrl = editedImage;

    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.image) {
        setEditedImage(data.image);
        if (styleOverride) setEditStyle(styleOverride);
      } else {
        setError(data.error || "Error re-editando");
      }
    } catch { setError("Error de conexion"); }
    setIsReEditing(false);
    setReEditPrompt("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-gold)] bg-[var(--bg-secondary)] shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--gold-primary)]/10"><SparklesIcon className="w-5 h-5 text-[var(--gold-light)]" /></div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Crear con AI</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* ═══ CONFIG STEP ═══ */}
          {step === "config" && (
            <>
              {/* Prompt */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Describe tu post</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Ej: "Before & after de pavers travertino en Scottsdale" o "Promo spring 15% off turf"'
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none" />
              </div>

              {/* Platform */}
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

              {/* Edit Style */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Estilo visual</label>
                <div className="grid grid-cols-3 gap-2">
                  {EDIT_STYLES.map((s) => (
                    <button key={s.key} onClick={() => setEditStyle(s.key)}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${editStyle === s.key ? "border-[var(--gold-primary)] shadow-lg shadow-[var(--gold-primary)]/15 scale-[1.03]" : "border-transparent hover:border-[var(--border-color)]"}`}>
                      <div className="h-8 rounded-t-lg" style={{ background: s.preview }} />
                      <p className="text-[9px] text-center py-1 text-[var(--text-muted)] font-medium bg-[var(--bg-primary)]">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Mode */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block font-semibold">Foto</label>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setPhotoMode("auto")}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${photoMode === "auto" ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                    Automatica
                  </button>
                  <button onClick={() => { setPhotoMode("choose"); if (!photosLoaded) loadPhotoOptions(); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${photoMode === "choose" ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                    Elegir foto
                  </button>
                </div>

                {photoMode === "auto" && (
                  <p className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-primary)]/50 px-3 py-2 rounded-lg">AI seleccionara la mejor foto de tu Viva Media Library segun el tema</p>
                )}

                {photoMode === "choose" && (
                  <div className="space-y-2">
                    {!photosLoaded ? (
                      <div className="flex items-center justify-center py-6"><span className="w-5 h-5 border-2 border-[var(--gold-primary)]/30 border-t-[var(--gold-primary)] rounded-full animate-spin" /></div>
                    ) : photoOptions.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] text-center py-4">No se encontraron fotos</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {photoOptions.slice(0, 6).map((photo) => (
                          <button key={photo.id} onClick={() => setSelectedPhoto(photo)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${selectedPhoto?.id === photo.id ? "border-[var(--gold-primary)] ring-2 ring-[var(--gold-primary)]/30 scale-105" : "border-[var(--border-color)]"}`}>
                            <img src={photo.thumbnail} alt={photo.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {["best-of-viva","pavers","turf","pergolas","softscape","before-after"].map((cat) => (
                        <button key={cat} onClick={() => loadPhotoOptions(cat)}
                          className="px-2 py-1 rounded-md text-[9px] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--gold-light)] transition-all">
                          {cat.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate */}
              <button onClick={generate} disabled={!prompt.trim() || (photoMode === "choose" && !selectedPhoto)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-[var(--gold-primary)]/25 transition-all active:scale-[0.98]">
                <SparklesIcon className="w-4 h-4 inline mr-2" />Generar Post Completo
              </button>
            </>
          )}

          {/* ═══ WORKING ═══ */}
          {step === "working" && (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[var(--gold-primary)]/20 border-t-[var(--gold-primary)] rounded-full animate-spin" />
                <SparklesIcon className="w-6 h-6 text-[var(--gold-light)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-[var(--text-primary)] font-semibold">{statusMsg}{dots}</p>
              <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)]" />Claude: Copy</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />Drive: Foto</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />Gemini: Edicion</span>
              </div>
            </div>
          )}

          {/* ═══ RESULT ═══ */}
          {step === "result" && (
            <>
              {/* Edited image */}
              <div className="rounded-2xl overflow-hidden border border-[var(--border-gold)] shadow-lg shadow-[var(--gold-primary)]/10">
                {isReEditing && (
                  <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center rounded-2xl">
                    <span className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <img src={editedImage} alt="Post editado" className="w-full aspect-square object-cover" />
              </div>

              {/* Caption */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-[var(--gold-light)] font-semibold">Caption</p>
                <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">{postData.caption}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{postData.hashtags}</p>
              </div>

              {/* Re-edit section */}
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/30 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Ajustar imagen</p>
                <div className="flex gap-1.5">
                  <input type="text" value={reEditPrompt} onChange={(e) => setReEditPrompt(e.target.value)}
                    placeholder="Ej: more contrast, warmer tones, bigger text..."
                    onKeyDown={(e) => e.key === "Enter" && reEditPrompt.trim() && reEdit(undefined, reEditPrompt.trim())}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)]" />
                  <button onClick={() => reEdit(undefined, reEditPrompt.trim())} disabled={!reEditPrompt.trim() || isReEditing}
                    className="px-3 py-2 rounded-lg bg-[var(--gold-primary)] text-[var(--bg-primary)] text-[11px] font-semibold disabled:opacity-40 transition-all">
                    {isReEditing ? dots || "..." : "Editar"}
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {EDIT_STYLES.filter((s) => s.key !== editStyle).map((s) => (
                    <button key={s.key} onClick={() => reEdit(s.key)} disabled={isReEditing}
                      className="px-2 py-1 rounded-md text-[9px] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--gold-light)] disabled:opacity-40 transition-all">
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { setStep("config"); setEditedImage(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                  Empezar de nuevo
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
