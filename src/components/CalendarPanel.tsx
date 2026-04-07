"use client";

import { useState, useEffect, useCallback } from "react";
import { posts as initialPosts, type Post, type Platform, type PostStatus } from "@/data/posts";
import {
  ChevronLeftIcon, ChevronRightIcon,
  InstagramIcon, TikTokIcon, YouTubeIcon,
  XIcon, PlusIcon, ClockIcon, EditIcon, TrashIcon, SparklesIcon,
} from "./Icons";

/* ── helpers ── */

const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function PlatformIconSmall({ platform, className = "w-3 h-3" }: { platform: Platform; className?: string }) {
  if (platform === "instagram") return <InstagramIcon className={className} />;
  if (platform === "tiktok") return <TikTokIcon className={className} />;
  return <YouTubeIcon className={className} />;
}

const platformColors: Record<Platform, string> = { instagram: "#e1306c", tiktok: "#00f2ea", youtube: "#ff4444" };

interface DrivePhoto {
  id: string;
  name: string;
  thumbnail: string;
  previewUrl: string;
}

interface DriveCategory {
  key: string;
  name: string;
  id: string;
}

/* ── Component ── */

export default function CalendarPanel() {
  const [allPosts, setAllPosts] = useState<Post[]>(initialPosts);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPlatform, setFormPlatform] = useState<Platform>("instagram");
  const [formStatus, setFormStatus] = useState<PostStatus>("borrador");
  const [formTime, setFormTime] = useState("12:00");
  const [formImage, setFormImage] = useState("");

  // AI generator state
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPlatform, setAiPlatform] = useState<Platform>("instagram");
  const [aiCategory, setAiCategory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [dots, setDots] = useState("");

  // Drive photos state
  const [drivePhotos, setDrivePhotos] = useState<DrivePhoto[]>([]);
  const [driveCategories, setDriveCategories] = useState<DriveCategory[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DrivePhoto | null>(null);

  // Gemini editing
  const [editingImage, setEditingImage] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState("");
  const [geminiPrompt, setGeminiPrompt] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const postsByDay: Record<number, Post[]> = {};
  allPosts.forEach((post) => {
    const d = new Date(post.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const isDayComplete = (day: number) => {
    const dp = postsByDay[day];
    return dp && dp.length > 0 && dp.every((p) => p.status === "publicado" || p.status === "listo");
  };

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] || []) : [];

  // Animated dots
  useEffect(() => {
    if (!generating && !editingImage) return;
    const iv = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [generating, editingImage]);

  const openPanel = (day: number) => {
    setSelectedDay(day);
    setEditingPost(null);
    setShowForm(false);
    setShowAI(false);
    setPanelOpen(true);
    setClosing(false);
  };

  const closePanel = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setPanelOpen(false);
      setClosing(false);
      setSelectedDay(null);
      setEditingPost(null);
      setShowForm(false);
      setShowAI(false);
      setShowPhotoPicker(false);
    }, 250);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && panelOpen) closePanel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelOpen, closePanel]);

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); setPanelOpen(false); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); setPanelOpen(false); };
  const goToday = () => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today.getDate()); };

  // ── Drive photos ──
  const loadDrivePhotos = async (cat?: string) => {
    setLoadingPhotos(true);
    try {
      const url = `/api/drive-photos?limit=24${cat ? `&category=${cat}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.photos) setDrivePhotos(data.photos);
      if (data.categories) setDriveCategories(data.categories);
    } catch { /* ignore */ }
    setLoadingPhotos(false);
  };

  const openPhotoPicker = () => {
    setShowPhotoPicker(true);
    if (drivePhotos.length === 0) loadDrivePhotos();
  };

  // ── Gemini image editing ──
  const editWithGemini = async () => {
    if (!selectedPhoto || !geminiPrompt.trim()) return;
    setEditingImage(true);
    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedPhoto.previewUrl,
          prompt: geminiPrompt,
          model: "pro",
        }),
      });
      const data = await res.json();
      if (data.image) {
        setEditedImageUrl(data.image);
        setFormImage(data.image);
      } else {
        setAiError(data.error || "No se pudo editar la imagen");
      }
    } catch { setAiError("Error editando imagen"); }
    setEditingImage(false);
  };

  // ── AI Generate Post ──
  const generateWithAI = async () => {
    if (!aiPrompt.trim() || !selectedDay) return;
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          platform: aiPlatform,
          category: aiCategory,
          style: "premium cinematografico",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || "Error generando post"); setGenerating(false); return; }

      const post = data.post;
      setFormTitle(post.title || "");
      setFormDesc(post.caption || "");
      setFormPlatform(aiPlatform);
      setFormStatus("borrador");
      setFormTime(post.suggestedTime || "12:00");
      if (post.imagePrompt) setGeminiPrompt(post.imagePrompt);
      setShowAI(false);
      setShowForm(true);
    } catch { setAiError("Error de conexion"); }
    setGenerating(false);
  };

  // ── Manual form actions ──
  const startNewPost = () => {
    setEditingPost(null);
    setFormTitle(""); setFormDesc(""); setFormPlatform("instagram"); setFormStatus("borrador"); setFormTime("12:00"); setFormImage("");
    setSelectedPhoto(null); setEditedImageUrl(""); setGeminiPrompt("");
    setShowForm(true); setShowAI(false);
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title); setFormDesc(post.description); setFormPlatform(post.platform); setFormStatus(post.status);
    setFormImage(post.image);
    const d = new Date(post.scheduledDate);
    setFormTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setShowForm(true); setShowAI(false);
  };

  const savePost = () => {
    if (!formTitle.trim() || !selectedDay) return;
    const [h, m] = formTime.split(":").map(Number);
    const scheduledDate = new Date(year, month, selectedDay, h, m).toISOString();
    const image = editedImageUrl || formImage || selectedPhoto?.previewUrl || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop";

    if (editingPost) {
      setAllPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, title: formTitle, description: formDesc, platform: formPlatform, status: formStatus, scheduledDate, image } : p));
    } else {
      setAllPosts((prev) => [...prev, {
        id: `new-${Date.now()}`, title: formTitle, description: formDesc, platform: formPlatform, status: formStatus, scheduledDate, image, tags: [],
      }]);
    }
    setShowForm(false); setEditingPost(null); setShowPhotoPicker(false); setSelectedPhoto(null); setEditedImageUrl("");
  };

  const deletePost = (id: string) => {
    setAllPosts((prev) => prev.filter((p) => p.id !== id));
    setShowForm(false); setEditingPost(null);
  };

  const totalRows = Math.ceil((firstDay + daysInMonth) / 7);

  return (
    <div className="flex flex-col h-full -mx-4 md:-mx-8 -my-6 md:pb-0 pb-16">

      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-secondary)]/30">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-90">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-gold-gradient min-w-[200px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-90">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Summary badges */}
          <div className="hidden md:flex items-center gap-3 mr-3 text-[11px]">
            <span className="text-[var(--text-muted)]">{allPosts.filter(p => { const d = new Date(p.scheduledDate); return d.getMonth() === month && d.getFullYear() === year; }).length} posts</span>
          </div>
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-gold)] text-[var(--gold-light)] hover:bg-[var(--gold-primary)]/10 transition-all">
            Hoy
          </button>
        </div>
      </div>

      {/* ── Day Headers ── */}
      <div className="grid grid-cols-7 border-b border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-secondary)]/20">
        {DAYS.map((day, i) => (
          <div key={day} className={`text-center text-[11px] font-semibold uppercase tracking-wider py-3 ${i < 6 ? "border-r border-[var(--border-color)]" : ""} ${i === 0 || i === 6 ? "text-[var(--text-muted)]/50" : "text-[var(--text-muted)]"}`}>
            {day}
          </div>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className={`grid grid-cols-7 flex-1 min-h-0 overflow-y-auto`} style={{ gridTemplateRows: `repeat(${totalRows}, minmax(80px, 1fr))` }}>
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className={`border-b border-[var(--border-color)] bg-[var(--bg-primary)]/40 ${i < firstDay - 1 || firstDay === 1 ? "border-r border-[var(--border-color)]" : ""} ${i < 6 ? "border-r border-[var(--border-color)]" : ""}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = postsByDay[day] || [];
          const isSelected = selectedDay === day && panelOpen;
          const todayFlag = isToday(day);
          const complete = isDayComplete(day);
          const empty = dayPosts.length === 0;
          const cellIdx = firstDay + i;
          const isLastCol = (cellIdx % 7) === 6;

          return (
            <button
              key={day}
              onClick={() => openPanel(day)}
              className={`
                relative flex flex-col text-left transition-all duration-200 p-1.5 md:p-2 overflow-hidden group
                border-b border-[var(--border-color)]
                ${!isLastCol ? "border-r border-[var(--border-color)]" : ""}
                ${empty ? "bg-[var(--bg-primary)]/50" : "bg-[var(--bg-secondary)]/20"}
                ${complete ? "shadow-[inset_0_-3px_0_var(--gold-primary)]" : ""}
                ${isSelected ? "bg-[var(--gold-primary)]/10 ring-2 ring-inset ring-[var(--gold-primary)]/40" : "hover:bg-[var(--bg-card)]/30"}
              `}
            >
              {/* Day number row */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`
                  text-xs font-semibold inline-flex items-center justify-center leading-none
                  ${todayFlag
                    ? "w-7 h-7 rounded-full bg-[var(--gold-primary)] text-[var(--bg-primary)] animate-today-pulse"
                    : isSelected ? "text-[var(--gold-light)]"
                    : empty ? "text-[var(--text-muted)]/40"
                    : "text-[var(--text-secondary)]"
                  }
                `}>
                  {day}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center" style={{ background: "var(--gold-primary)", color: "var(--bg-primary)", opacity: 0.8 }}>
                    {dayPosts.length}
                  </span>
                )}
              </div>

              {/* Post entries — desktop */}
              <div className="flex-1 space-y-[3px] overflow-hidden hidden md:block w-full">
                {dayPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center gap-1.5 rounded-md px-1.5 py-[3px] bg-[var(--bg-primary)]/50 group-hover:bg-[var(--bg-primary)]/70 transition-colors w-full">
                    <img src={post.image} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                    <span className="flex-shrink-0" style={{ color: platformColors[post.platform] }}>
                      <PlatformIconSmall platform={post.platform} className="w-3 h-3" />
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] truncate flex-1 leading-tight">{post.title}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <p className="text-[9px] text-[var(--text-muted)] px-1.5">+{dayPosts.length - 3} mas</p>
                )}
              </div>

              {/* Post entries — mobile */}
              <div className="flex items-center gap-1 mt-auto md:hidden flex-wrap">
                {dayPosts.slice(0, 4).map((p) => (
                  <span key={p.id} className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: platformColors[p.platform] }} />
                ))}
              </div>

              {complete && <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-t-[var(--gold-primary)] border-l-[14px] border-l-transparent" />}
            </button>
          );
        })}

        {/* Trailing empty cells */}
        {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => {
          const cellIdx = firstDay + daysInMonth + i;
          const isLastCol = (cellIdx % 7) === 6;
          return <div key={`t-${i}`} className={`border-b border-[var(--border-color)] bg-[var(--bg-primary)]/40 ${!isLastCol ? "border-r border-[var(--border-color)]" : ""}`} />;
        })}
      </div>

      {/* ═══════════════ SIDE PANEL ═══════════════ */}
      {panelOpen && (
        <>
          <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm ${closing ? "opacity-0 transition-opacity duration-200" : "animate-overlay-in"}`} onClick={closePanel} />

          <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] md:w-[480px] bg-[var(--bg-secondary)] border-l border-[var(--border-color)] shadow-2xl shadow-black/50 flex flex-col ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}`}>

            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-card)]/30">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{selectedDay} de {MONTHS[month]}, {year}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{selectedPosts.length} publicacion{selectedPosts.length !== 1 ? "es" : ""}</p>
              </div>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">

              {/* ── AI GENERATOR ── */}
              {showAI && (
                <div className="space-y-3 animate-fade-up">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-[var(--gold-primary)]/10"><SparklesIcon className="w-4 h-4 text-[var(--gold-light)]" /></div>
                    <h4 className="text-sm font-bold text-gold-gradient">Generar con AI</h4>
                  </div>

                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder='Ej: "Post de before & after de instalacion de pavers" o "Promo de primavera para turf"' rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none" />

                  <div className="flex gap-1.5">
                    {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                      <button key={p} onClick={() => setAiPlatform(p)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center ${aiPlatform === p ? (p === "instagram" ? "badge-instagram" : p === "tiktok" ? "badge-tiktok" : "badge-youtube") : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                        <PlatformIconSmall platform={p} className="w-3 h-3" />{p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>

                  <select value={aiCategory} onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] [color-scheme:dark]">
                    <option value="">Categoria de foto (opcional)</option>
                    <option value="pavers">Pavers</option>
                    <option value="turf">Turf</option>
                    <option value="pergolas">Pergolas</option>
                    <option value="softscape">Softscape</option>
                    <option value="before-after">Before & After</option>
                    <option value="best-of-viva">Best of Viva</option>
                  </select>

                  {aiError && <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{aiError}</p>}

                  <div className="flex gap-2">
                    <button onClick={generateWithAI} disabled={!aiPrompt.trim() || generating}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.98]">
                      {generating ? <><span className="w-3.5 h-3.5 border-2 border-[var(--bg-primary)]/30 border-t-[var(--bg-primary)] rounded-full animate-spin" />Generando{dots}</> : <><SparklesIcon className="w-4 h-4" />Generar</>}
                    </button>
                    <button onClick={() => setShowAI(false)} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">Cancelar</button>
                  </div>
                </div>
              )}

              {/* ── FORM ── */}
              {showForm && !showAI && (
                <div className="space-y-3 animate-fade-up">
                  <h4 className="text-sm font-semibold text-gold-gradient">{editingPost ? "Editar Publicacion" : "Nueva Publicacion"}</h4>

                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Titulo del post"
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] transition-all" />

                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Caption / descripcion..." rows={4}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] transition-all resize-none" />

                  {/* Photo section */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Foto</label>
                    {(editedImageUrl || formImage || selectedPhoto) ? (
                      <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)]">
                        <img src={editedImageUrl || formImage || selectedPhoto?.previewUrl} alt="" className="w-full aspect-square object-cover" />
                        <button onClick={() => { setSelectedPhoto(null); setEditedImageUrl(""); setFormImage(""); }}
                          className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all">
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                        {selectedPhoto && !editedImageUrl && (
                          <div className="p-2 bg-[var(--bg-primary)]/90 border-t border-[var(--border-color)]">
                            <div className="flex gap-1.5">
                              <input type="text" value={geminiPrompt} onChange={(e) => setGeminiPrompt(e.target.value)} placeholder="Instruccion para Gemini: ej. add warm cinematic color grade..."
                                className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none" />
                              <button onClick={editWithGemini} disabled={!geminiPrompt.trim() || editingImage}
                                className="px-3 py-1.5 rounded-lg bg-[var(--gold-primary)] text-[var(--bg-primary)] text-[11px] font-semibold disabled:opacity-40 transition-all flex items-center gap-1">
                                {editingImage ? <><span className="w-3 h-3 border-2 border-[var(--bg-primary)]/30 border-t-[var(--bg-primary)] rounded-full animate-spin" />{dots}</> : "Editar"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={openPhotoPicker}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all flex flex-col items-center gap-1">
                        <span className="text-lg">📷</span>
                        <span className="text-xs font-medium">Elegir foto de Drive</span>
                        <span className="text-[10px]">Viva Media Library</span>
                      </button>
                    )}
                  </div>

                  {/* Photo Picker */}
                  {showPhotoPicker && !selectedPhoto && (
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 p-3 space-y-2 animate-fade-up">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">Viva Media Library</p>
                        <button onClick={() => setShowPhotoPicker(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                      {driveCategories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          <button onClick={() => loadDrivePhotos()} className="px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--gold-primary)]/10 text-[var(--gold-light)] border border-[var(--border-gold)]">Todas</button>
                          {driveCategories.slice(0, 6).map((cat) => (
                            <button key={cat.key} onClick={() => loadDrivePhotos(cat.key)} className="px-2 py-1 rounded-md text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--border-gold)] transition-all">{cat.name}</button>
                          ))}
                        </div>
                      )}
                      {loadingPhotos ? (
                        <div className="flex items-center justify-center py-8"><span className="w-5 h-5 border-2 border-[var(--gold-primary)]/30 border-t-[var(--gold-primary)] rounded-full animate-spin" /></div>
                      ) : drivePhotos.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4">No se encontraron fotos</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                          {drivePhotos.map((photo) => (
                            <button key={photo.id} onClick={() => { setSelectedPhoto(photo); setFormImage(photo.previewUrl); setShowPhotoPicker(false); }}
                              className="aspect-square rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--gold-primary)] transition-all hover:scale-105">
                              <img src={photo.thumbnail} alt={photo.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Platform + Status + Time */}
                  <div className="flex gap-1.5">
                    {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                      <button key={p} onClick={() => setFormPlatform(p)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-1 justify-center ${formPlatform === p ? (p === "instagram" ? "badge-instagram" : p === "tiktok" ? "badge-tiktok" : "badge-youtube") : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]"}`}>
                        <PlatformIconSmall platform={p} className="w-3 h-3" />{p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex gap-1.5">
                      {(["borrador", "listo", "publicado"] as const).map((s) => (
                        <button key={s} onClick={() => setFormStatus(s)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${formStatus === s ? (s === "borrador" ? "status-draft" : s === "listo" ? "status-ready" : "status-published") : "text-[var(--text-muted)]"}`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <ClockIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] [color-scheme:dark]" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={savePost} disabled={!formTitle.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.98]">
                      {editingPost ? "Guardar" : "Crear Publicacion"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditingPost(null); setShowPhotoPicker(false); }}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] transition-all">Cancelar</button>
                  </div>

                  {editingPost && (
                    <button onClick={() => deletePost(editingPost.id)} className="w-full py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all flex items-center justify-center gap-1.5">
                      <TrashIcon className="w-3.5 h-3.5" />Eliminar
                    </button>
                  )}
                </div>
              )}

              {/* ── POST LIST ── */}
              {!showForm && !showAI && (
                <>
                  {selectedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-up">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-3"><span className="text-xl">📅</span></div>
                      <p className="text-sm text-[var(--text-secondary)] font-medium">Sin publicaciones</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Este dia esta libre</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPosts.map((post, idx) => (
                        <div key={post.id} className="animate-fade-up stagger flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-color)] hover:border-[var(--border-gold)] transition-all group/card" style={{ "--i": idx } as React.CSSProperties}>
                          <div className="relative flex-shrink-0">
                            <img src={post.image} alt={post.title} className="w-14 h-14 rounded-lg object-cover" />
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md" style={{ background: platformColors[post.platform] }}>
                              <PlatformIconSmall platform={post.platform} className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{post.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${post.status === "borrador" ? "status-draft" : post.status === "listo" ? "status-ready" : "status-published"}`}>{post.status}</span>
                              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1"><ClockIcon className="w-3 h-3" />{new Date(post.scheduledDate).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); startEdit(post); }} className="p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-[var(--gold-primary)]/10 text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all flex-shrink-0">
                            <EditIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel Footer */}
            {!showForm && !showAI && (
              <div className="border-t border-[var(--border-color)] p-4 flex-shrink-0 space-y-2">
                <button onClick={() => { setShowAI(true); setAiPrompt(""); setAiError(""); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-[0.98]">
                  <SparklesIcon className="w-4 h-4" />Generar con AI
                </button>
                <button onClick={startNewPost}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-gold)] text-sm transition-all">
                  <PlusIcon className="w-4 h-4" />Manual
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
