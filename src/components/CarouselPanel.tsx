"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon,
  XIcon, DownloadIcon, CopyIcon, EditIcon, LayoutIcon,
} from "./Icons";

/* ── Types ── */

interface Slide {
  type: "cover" | "content" | "cta";
  headline: string;
  subtext?: string;
  body?: string;
  number?: number;
}

interface Carousel {
  id: string;
  topic: string;
  title: string;
  slides: Slide[];
  style: string;
  createdAt: string;
}

/* ── Visual Styles ── */

interface VisualStyle {
  key: string;
  name: string;
  bg: string;
  coverBg: string;
  ctaBg: string;
  headlineColor: string;
  bodyColor: string;
  subtextColor: string;
  accentColor: string;
  numberBg: string;
  numberColor: string;
  fontClass: string;
  preview: string; // gradient for selector thumbnail
}

const STYLES: VisualStyle[] = [
  {
    key: "gold-dark",
    name: "Gold Premium",
    bg: "linear-gradient(160deg, #0a0a0f, #1a1a2e)",
    coverBg: "linear-gradient(160deg, #1a1510, #0a0a0f)",
    ctaBg: "linear-gradient(160deg, #1a1510, #12121a)",
    headlineColor: "#f0d078",
    bodyColor: "#c8c8d8",
    subtextColor: "#9898a8",
    accentColor: "#d4a843",
    numberBg: "#d4a843",
    numberColor: "#0a0a0f",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #d4a843, #0a0a0f)",
  },
  {
    key: "green-nature",
    name: "Natural",
    bg: "linear-gradient(160deg, #0a1a0f, #0f1f14)",
    coverBg: "linear-gradient(160deg, #0f2618, #0a1a0f)",
    ctaBg: "linear-gradient(160deg, #0f2618, #0a1a0f)",
    headlineColor: "#86efac",
    bodyColor: "#c5e8d0",
    subtextColor: "#7aaa8c",
    accentColor: "#22c55e",
    numberBg: "#22c55e",
    numberColor: "#0a1a0f",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #22c55e, #0a1a0f)",
  },
  {
    key: "blue-modern",
    name: "Moderno",
    bg: "linear-gradient(160deg, #080818, #0e1225)",
    coverBg: "linear-gradient(160deg, #0c1530, #080818)",
    ctaBg: "linear-gradient(160deg, #0c1530, #080818)",
    headlineColor: "#93c5fd",
    bodyColor: "#bfcfe8",
    subtextColor: "#6889aa",
    accentColor: "#3b82f6",
    numberBg: "#3b82f6",
    numberColor: "#ffffff",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #3b82f6, #080818)",
  },
  {
    key: "warm-earth",
    name: "Terracota",
    bg: "linear-gradient(160deg, #1a1210, #1f1510)",
    coverBg: "linear-gradient(160deg, #2a1a14, #1a1210)",
    ctaBg: "linear-gradient(160deg, #2a1a14, #1a1210)",
    headlineColor: "#fbbf6e",
    bodyColor: "#dcc4a8",
    subtextColor: "#a07850",
    accentColor: "#e87e3c",
    numberBg: "#e87e3c",
    numberColor: "#1a1210",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #e87e3c, #1a1210)",
  },
  {
    key: "minimal-white",
    name: "Minimalista",
    bg: "linear-gradient(160deg, #f8f8f8, #ececec)",
    coverBg: "linear-gradient(160deg, #ffffff, #f4f4f4)",
    ctaBg: "linear-gradient(160deg, #f0f0f0, #e8e8e8)",
    headlineColor: "#111111",
    bodyColor: "#444444",
    subtextColor: "#888888",
    accentColor: "#111111",
    numberBg: "#111111",
    numberColor: "#ffffff",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #ffffff, #999999)",
  },
  {
    key: "sunset-viva",
    name: "Atardecer",
    bg: "linear-gradient(160deg, #1a0a1e, #120818)",
    coverBg: "linear-gradient(160deg, #2a0e2e, #1a0a1e)",
    ctaBg: "linear-gradient(160deg, #2a0e2e, #1a0a1e)",
    headlineColor: "#f9a8d4",
    bodyColor: "#dbb8cc",
    subtextColor: "#9a6880",
    accentColor: "#ec4899",
    numberBg: "#ec4899",
    numberColor: "#ffffff",
    fontClass: "font-sans",
    preview: "linear-gradient(135deg, #ec4899, #1a0a1e)",
  },
];

const STORAGE_KEY = "viva-social-hub-carousels";

/* ── Slide Preview Component ── */

function SlidePreview({
  slide,
  style,
  index,
  total,
  editing,
  onStartEdit,
  onSave,
  onCancel,
  editHeadline,
  setEditHeadline,
  editBody,
  setEditBody,
  editSubtext,
  setEditSubtext,
}: {
  slide: Slide;
  style: VisualStyle;
  index: number;
  total: number;
  editing: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editHeadline: string;
  setEditHeadline: (v: string) => void;
  editBody: string;
  setEditBody: (v: string) => void;
  editSubtext: string;
  setEditSubtext: (v: string) => void;
}) {
  const bg = slide.type === "cover" ? style.coverBg : slide.type === "cta" ? style.ctaBg : style.bg;

  return (
    <div className="relative group">
      {/* Slide card */}
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden flex flex-col justify-center items-center p-6 md:p-8 text-center ${style.fontClass} transition-all`}
        style={{ background: bg }}
      >
        {/* Page indicator */}
        <div className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${style.accentColor}20`, color: style.subtextColor }}>
          {index + 1}/{total}
        </div>

        {/* Accent line */}
        <div className="w-10 h-0.5 rounded-full mb-4" style={{ background: style.accentColor }} />

        {editing ? (
          /* ── Edit Mode ── */
          <div className="w-full space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm font-bold resize-none focus:outline-none focus:border-white/30"
              style={{ color: style.headlineColor }}
            />
            {(slide.type === "content" && slide.body !== undefined) && (
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-xs resize-none focus:outline-none focus:border-white/30"
                style={{ color: style.bodyColor }}
              />
            )}
            {(slide.subtext !== undefined) && (
              <input
                type="text"
                value={editSubtext}
                onChange={(e) => setEditSubtext(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-xs focus:outline-none focus:border-white/30"
                style={{ color: style.subtextColor }}
              />
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={onSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: style.accentColor, color: style.numberColor }}>Guardar</button>
              <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs border border-white/10" style={{ color: style.subtextColor }}>Cancelar</button>
            </div>
          </div>
        ) : (
          /* ── Display Mode ── */
          <>
            {slide.type === "content" && slide.number && (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-3" style={{ background: style.numberBg, color: style.numberColor }}>
                {slide.number}
              </div>
            )}

            <h3
              className={`font-bold leading-tight mb-2 ${slide.type === "cover" ? "text-xl md:text-2xl" : slide.type === "cta" ? "text-lg md:text-xl" : "text-base md:text-lg"}`}
              style={{ color: style.headlineColor }}
            >
              {slide.headline}
            </h3>

            {slide.body && (
              <p className="text-xs md:text-sm leading-relaxed max-w-[85%] whitespace-pre-line" style={{ color: style.bodyColor }}>{slide.body}</p>
            )}

            {slide.subtext && (
              <p className="text-[11px] md:text-xs mt-3 font-medium" style={{ color: style.subtextColor }}>{slide.subtext}</p>
            )}

            {slide.type === "cta" && (
              <div className="mt-4 px-5 py-2 rounded-full text-xs font-bold" style={{ background: style.accentColor, color: style.numberColor }}>
                Saber mas
              </div>
            )}

            {slide.type === "cover" && (
              <p className="text-[10px] mt-4 tracking-wider uppercase font-semibold" style={{ color: style.accentColor }}>
                Desliza &rarr;
              </p>
            )}
          </>
        )}
      </div>

      {/* Edit button overlay */}
      {!editing && (
        <button
          onClick={onStartEdit}
          className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all"
          style={{ color: style.headlineColor }}
        >
          <EditIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── Main Component ── */

export default function CarouselPanel() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeCarousel, setActiveCarousel] = useState<Carousel | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);

  // edit fields
  const [editHeadline, setEditHeadline] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSubtext, setEditSubtext] = useState("");

  // generator
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(7);
  const [selectedStyle, setSelectedStyle] = useState("gold-dark");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setCarousels(JSON.parse(saved)); } catch { /* ignore */ } }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(carousels));
  }, [carousels, loaded]);

  // loading dots
  useEffect(() => {
    if (!generating) return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [generating]);

  const getStyle = useCallback((key: string) => STYLES.find((s) => s.key === key) || STYLES[0], []);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), slideCount, notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al generar"); setGenerating(false); return; }

      const newCarousel: Carousel = {
        id: `car-${Date.now()}`,
        topic: topic.trim(),
        title: data.carousel.title,
        slides: data.carousel.slides,
        style: selectedStyle,
        createdAt: new Date().toISOString(),
      };

      setCarousels((prev) => [newCarousel, ...prev]);
      setActiveCarousel(newCarousel);
      setActiveSlide(0);
      setShowGenerator(false);
      setTopic("");
      setNotes("");
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteCarousel = (id: string) => {
    setCarousels((prev) => prev.filter((c) => c.id !== id));
    if (activeCarousel?.id === id) { setActiveCarousel(null); }
  };

  const startEdit = (idx: number) => {
    if (!activeCarousel) return;
    const s = activeCarousel.slides[idx];
    setEditHeadline(s.headline);
    setEditBody(s.body || "");
    setEditSubtext(s.subtext || "");
    setEditingSlide(idx);
  };

  const saveEdit = () => {
    if (editingSlide === null || !activeCarousel) return;
    const updated = { ...activeCarousel, slides: activeCarousel.slides.map((s, i) =>
      i === editingSlide ? { ...s, headline: editHeadline, body: editBody || undefined, subtext: editSubtext || undefined } : s
    )};
    setActiveCarousel(updated);
    setCarousels((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditingSlide(null);
  };

  const cancelEdit = () => setEditingSlide(null);

  // Download single slide as PNG
  const downloadSlide = (idx: number) => {
    if (!activeCarousel) return;
    const slide = activeCarousel.slides[idx];
    const style = getStyle(activeCarousel.style);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = style.key === "minimal-white" ? "#f8f8f8" : "#0a0a0f";
    ctx.fillRect(0, 0, size, size);

    // Accent line
    ctx.fillStyle = style.accentColor;
    ctx.fillRect(size / 2 - 40, 260, 80, 4);

    // Number circle for content slides
    let yOffset = 310;
    if (slide.type === "content" && slide.number) {
      ctx.beginPath();
      ctx.arc(size / 2, 330, 32, 0, Math.PI * 2);
      ctx.fillStyle = style.numberBg;
      ctx.fill();
      ctx.fillStyle = style.numberColor;
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(slide.number), size / 2, 340);
      yOffset = 400;
    }

    // Headline
    ctx.fillStyle = style.headlineColor;
    const headSize = slide.type === "cover" ? 52 : 44;
    ctx.font = `bold ${headSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    wrapText(ctx, slide.headline, size / 2, yOffset, size - 160, headSize * 1.25);

    // Body
    if (slide.body) {
      const headLines = Math.ceil(ctx.measureText(slide.headline).width / (size - 160));
      const bodyY = yOffset + headLines * headSize * 1.25 + 30;
      ctx.fillStyle = style.bodyColor;
      ctx.font = "400 28px system-ui, sans-serif";
      wrapText(ctx, slide.body, size / 2, bodyY, size - 180, 38);
    }

    // Subtext
    if (slide.subtext) {
      ctx.fillStyle = style.subtextColor;
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillText(slide.subtext, size / 2, size - 200);
    }

    // Page indicator
    ctx.fillStyle = style.subtextColor;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${idx + 1}/${activeCarousel.slides.length}`, size - 50, 55);

    // CTA button
    if (slide.type === "cta") {
      const btnW = 240;
      const btnH = 52;
      const btnX = (size - btnW) / 2;
      const btnY = size - 160;
      ctx.fillStyle = style.accentColor;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 26);
      ctx.fill();
      ctx.fillStyle = style.numberColor;
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Saber mas", size / 2, btnY + 34);
    }

    // Cover "Desliza" label
    if (slide.type === "cover") {
      ctx.fillStyle = style.accentColor;
      ctx.font = "600 20px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DESLIZA →", size / 2, size - 120);
    }

    // Download
    const link = document.createElement("a");
    link.download = `slide-${idx + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadAll = () => {
    if (!activeCarousel) return;
    activeCarousel.slides.forEach((_, i) => {
      setTimeout(() => downloadSlide(i), i * 300);
    });
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Carruseles AI</h2>
          <p className="text-sm text-[var(--text-muted)]">Crea carruseles completos con inteligencia artificial</p>
        </div>
        <button
          onClick={() => { setShowGenerator(true); setActiveCarousel(null); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-95"
        >
          <SparklesIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Carrusel</span>
        </button>
      </div>

      {/* ═══════ GENERATOR ═══════ */}
      {showGenerator && (
        <div className="animate-fade-up rounded-2xl border border-[var(--border-gold)] bg-gradient-to-br from-[var(--gold-primary)]/5 to-[var(--bg-card)] p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--gold-primary)]/10"><SparklesIcon className="w-5 h-5 text-[var(--gold-light)]" /></div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Generador de Carruseles</h3>
                <p className="text-xs text-[var(--text-muted)]">Describe el tema y elige el estilo visual</p>
              </div>
            </div>
            <button onClick={() => setShowGenerator(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Topic */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Tema del carrusel *</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='Ej: "7 pasos para diseñar tu patio ideal" o "Turf sintetico: mitos vs realidad"'
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none"
            />
          </div>

          {/* Slides count + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Filminas ({slideCount})</label>
              <input
                type="range"
                min={4}
                max={12}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full accent-[var(--gold-primary)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]"><span>4</span><span>12</span></div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Notas <span className="normal-case tracking-normal">(opcional)</span></label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: enfocarse en ahorro de agua..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all"
              />
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Estilo Visual</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelectedStyle(s.key)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedStyle === s.key ? "border-[var(--gold-primary)] shadow-lg shadow-[var(--gold-primary)]/15 scale-105" : "border-transparent hover:border-[var(--border-color)]"
                  }`}
                >
                  <div className="aspect-square rounded-lg" style={{ background: s.preview }} />
                  <p className="text-[10px] text-center py-1 text-[var(--text-muted)] font-medium">{s.name}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

          <button
            onClick={generate}
            disabled={!topic.trim() || generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--gold-primary)]/25 transition-all active:scale-[0.98]"
          >
            {generating ? (
              <><span className="w-4 h-4 border-2 border-[var(--bg-primary)]/30 border-t-[var(--bg-primary)] rounded-full animate-spin" />Generando carrusel{dots}</>
            ) : (
              <><SparklesIcon className="w-4 h-4" />Generar Carrusel con AI</>
            )}
          </button>
        </div>
      )}

      {/* ═══════ ACTIVE CAROUSEL PREVIEW ═══════ */}
      {activeCarousel && !showGenerator && (
        <div className="animate-fade-up space-y-5">
          {/* Back + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button onClick={() => { setActiveCarousel(null); setEditingSlide(null); }} className="text-xs text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all flex items-center gap-1">
              <ChevronRightIcon className="w-3 h-3 rotate-180" />Volver a la biblioteca
            </button>
            <div className="flex items-center gap-2">
              {/* Style switcher */}
              <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-0.5">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      const updated = { ...activeCarousel, style: s.key };
                      setActiveCarousel(updated);
                      setCarousels((prev) => prev.map((c) => c.id === updated.id ? updated : c));
                    }}
                    title={s.name}
                    className={`w-5 h-5 rounded-md transition-all ${activeCarousel.style === s.key ? "ring-2 ring-[var(--gold-primary)] scale-110" : "opacity-60 hover:opacity-100"}`}
                    style={{ background: s.preview }}
                  />
                ))}
              </div>
              <button onClick={downloadAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--gold-light)] transition-all">
                <DownloadIcon className="w-3.5 h-3.5" />Descargar todo
              </button>
              <button onClick={() => deleteCarousel(activeCarousel.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="rounded-2xl border border-[var(--border-gold)] bg-gradient-to-br from-[var(--gold-primary)]/5 to-[var(--bg-card)] p-4">
            <h3 className="text-base font-bold text-gold-gradient">{activeCarousel.title}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{activeCarousel.slides.length} filminas &middot; Tema: {activeCarousel.topic}</p>
          </div>

          {/* ── Featured Slide Preview (Large) ── */}
          <div className="max-w-md mx-auto">
            <SlidePreview
              slide={activeCarousel.slides[activeSlide]}
              style={getStyle(activeCarousel.style)}
              index={activeSlide}
              total={activeCarousel.slides.length}
              editing={editingSlide === activeSlide}
              onStartEdit={() => startEdit(activeSlide)}
              onSave={saveEdit}
              onCancel={cancelEdit}
              editHeadline={editHeadline}
              setEditHeadline={setEditHeadline}
              editBody={editBody}
              setEditBody={setEditBody}
              editSubtext={editSubtext}
              setEditSubtext={setEditSubtext}
            />
            {/* Nav arrows + download */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadSlide(activeSlide)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--gold-light)] hover:bg-[var(--gold-primary)]/10 transition-all"
              >
                <DownloadIcon className="w-3.5 h-3.5" />PNG
              </button>
              <button
                onClick={() => setActiveSlide(Math.min(activeCarousel.slides.length - 1, activeSlide + 1))}
                disabled={activeSlide === activeCarousel.slides.length - 1}
                className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Thumbnails Strip ── */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {activeCarousel.slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveSlide(idx); setEditingSlide(null); }}
                  className={`flex-shrink-0 w-24 md:w-28 rounded-xl overflow-hidden border-2 transition-all ${
                    activeSlide === idx ? "border-[var(--gold-primary)] shadow-lg shadow-[var(--gold-primary)]/10 scale-105" : "border-[var(--border-color)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className="aspect-square p-2 flex flex-col items-center justify-center text-center"
                    style={{ background: getStyle(activeCarousel.style).bg }}
                  >
                    {slide.type === "content" && slide.number && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold mb-1"
                        style={{ background: getStyle(activeCarousel.style).numberBg, color: getStyle(activeCarousel.style).numberColor }}>
                        {slide.number}
                      </div>
                    )}
                    <p className="text-[8px] font-bold leading-tight line-clamp-3" style={{ color: getStyle(activeCarousel.style).headlineColor }}>
                      {slide.headline}
                    </p>
                    <p className="text-[7px] mt-0.5" style={{ color: getStyle(activeCarousel.style).subtextColor }}>
                      {slide.type === "cover" ? "Portada" : slide.type === "cta" ? "CTA" : `#${slide.number}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ LIBRARY ═══════ */}
      {!activeCarousel && !showGenerator && (
        <>
          {carousels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gold-primary)]/10 to-[var(--bg-card)] border border-[var(--border-gold)] flex items-center justify-center mb-4">
                <LayoutIcon className="w-8 h-8 text-[var(--gold-light)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-semibold text-base">Sin carruseles todavia</p>
              <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Genera tu primer carrusel con AI. Elige el tema, el estilo y descarga las filminas listas.</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-95"
              >
                <SparklesIcon className="w-4 h-4" />Crear Primer Carrusel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">{carousels.length} carrusel{carousels.length !== 1 ? "es" : ""} guardado{carousels.length !== 1 ? "s" : ""}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {carousels.map((car, idx) => {
                  const st = getStyle(car.style);
                  return (
                    <button
                      key={car.id}
                      onClick={() => { setActiveCarousel(car); setActiveSlide(0); setEditingSlide(null); }}
                      className="animate-fade-up stagger text-left rounded-2xl border border-[var(--border-color)] overflow-hidden hover:border-[var(--border-gold)] hover:shadow-lg hover:shadow-[var(--gold-primary)]/5 transition-all group"
                      style={{ "--i": idx } as React.CSSProperties}
                    >
                      {/* Mini preview of first 3 slides */}
                      <div className="flex h-24">
                        {car.slides.slice(0, 3).map((sl, si) => (
                          <div key={si} className="flex-1 flex items-center justify-center p-2 text-center border-r border-[var(--border-color)] last:border-r-0" style={{ background: st.bg }}>
                            <p className="text-[8px] font-bold leading-tight line-clamp-3" style={{ color: st.headlineColor }}>{sl.headline}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-[var(--bg-card)]/40">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold-light)] transition-colors truncate">{car.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-[var(--text-muted)]">{car.slides.length} filminas</span>
                          <span className="w-3 h-3 rounded-sm" style={{ background: st.preview }} />
                          <span className="text-[10px] text-[var(--text-muted)]">{st.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                            {new Date(car.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Canvas text wrapping helper ── */

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
