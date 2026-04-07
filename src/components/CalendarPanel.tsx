"use client";

import { useState, useEffect, useCallback } from "react";
import { posts as initialPosts, type Post, type Platform, type PostStatus } from "@/data/posts";
import {
  ChevronLeftIcon, ChevronRightIcon,
  InstagramIcon, TikTokIcon, YouTubeIcon,
  XIcon, PlusIcon, ClockIcon, EditIcon, TrashIcon,
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

/* ── Component ── */

export default function CalendarPanel() {
  const [allPosts, setAllPosts] = useState<Post[]>(initialPosts);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPlatform, setFormPlatform] = useState<Platform>("instagram");
  const [formStatus, setFormStatus] = useState<PostStatus>("borrador");
  const [formTime, setFormTime] = useState("12:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  // group posts by day
  const postsByDay: Record<number, Post[]> = {};
  allPosts.forEach((post) => {
    const d = new Date(post.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  // is a day "complete"? all posts are "publicado" or "listo"
  const isDayComplete = (day: number) => {
    const dp = postsByDay[day];
    return dp && dp.length > 0 && dp.every((p) => p.status === "publicado" || p.status === "listo");
  };

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] || []) : [];

  const openPanel = (day: number) => {
    setSelectedDay(day);
    setEditingPost(null);
    setShowForm(false);
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
    }, 250);
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && panelOpen) closePanel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelOpen, closePanel]);

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); setPanelOpen(false); };
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); setPanelOpen(false); };

  const goToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const startNewPost = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormDesc("");
    setFormPlatform("instagram");
    setFormStatus("borrador");
    setFormTime("12:00");
    setShowForm(true);
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormDesc(post.description);
    setFormPlatform(post.platform);
    setFormStatus(post.status);
    const d = new Date(post.scheduledDate);
    setFormTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setShowForm(true);
  };

  const savePost = () => {
    if (!formTitle.trim() || !selectedDay) return;
    const [h, m] = formTime.split(":").map(Number);
    const scheduledDate = new Date(year, month, selectedDay, h, m).toISOString();

    if (editingPost) {
      setAllPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...p, title: formTitle, description: formDesc, platform: formPlatform, status: formStatus, scheduledDate } : p));
    } else {
      const newPost: Post = {
        id: `new-${Date.now()}`,
        title: formTitle,
        description: formDesc,
        platform: formPlatform,
        status: formStatus,
        scheduledDate,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
        tags: [],
      };
      setAllPosts((prev) => [...prev, newPost]);
    }
    setShowForm(false);
    setEditingPost(null);
  };

  const deletePost = (id: string) => {
    setAllPosts((prev) => prev.filter((p) => p.id !== id));
    setShowForm(false);
    setEditingPost(null);
  };

  return (
    <div className="flex flex-col h-full -mx-4 md:-mx-8 -my-6 md:pb-0 pb-16">

      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-90">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-gold-gradient min-w-[180px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-90">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-gold)] text-[var(--gold-light)] hover:bg-[var(--gold-primary)]/10 transition-all">
          Hoy
        </button>
      </div>

      {/* ── Day Headers ── */}
      <div className="grid grid-cols-7 border-b border-[var(--border-color)] flex-shrink-0">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] py-2.5 border-r border-[var(--border-color)] last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr min-h-0 overflow-y-auto">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-[var(--border-color)] last:border-r-0 bg-[var(--bg-primary)]/60" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = postsByDay[day] || [];
          const isSelected = selectedDay === day && panelOpen;
          const todayFlag = isToday(day);
          const complete = isDayComplete(day);
          const empty = dayPosts.length === 0;

          return (
            <button
              key={day}
              onClick={() => openPanel(day)}
              className={`
                animate-cal-cell stagger relative flex flex-col border-r border-b border-[var(--border-color)] last:border-r-0
                text-left transition-all duration-200 p-1 md:p-1.5 overflow-hidden group min-h-[60px] md:min-h-0
                ${empty ? "bg-[#06060a]/60" : "bg-[var(--bg-secondary)]/30"}
                ${complete ? "border-b-[var(--gold-primary)]/40 shadow-[inset_0_-2px_0_var(--gold-primary)]" : ""}
                ${isSelected ? "bg-[var(--gold-primary)]/8 ring-1 ring-inset ring-[var(--gold-primary)]/30" : "hover:bg-[var(--bg-card)]/40"}
              `}
              style={{ "--i": i % 7 } as React.CSSProperties}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-0.5">
                <span className={`
                  text-[11px] md:text-xs font-semibold inline-flex items-center justify-center
                  ${todayFlag
                    ? "w-6 h-6 rounded-full bg-[var(--gold-primary)] text-[var(--bg-primary)] animate-today-pulse"
                    : isSelected
                    ? "text-[var(--gold-light)]"
                    : empty
                    ? "text-[var(--text-muted)]/60"
                    : "text-[var(--text-secondary)]"
                  }
                `}>
                  {day}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[9px] text-[var(--text-muted)] font-medium">{dayPosts.length}</span>
                )}
              </div>

              {/* Post thumbnails — hidden on very small screens */}
              <div className="flex-1 space-y-0.5 overflow-hidden hidden md:block">
                {dayPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center gap-1 rounded-md px-1 py-0.5 bg-[var(--bg-primary)]/40 group-hover:bg-[var(--bg-primary)]/60 transition-colors">
                    <img src={post.image} alt="" className="w-4 h-4 rounded-[3px] object-cover flex-shrink-0" />
                    <PlatformIconSmall platform={post.platform} className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="text-[9px] text-[var(--text-secondary)] truncate leading-tight">{post.title}</span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[9px] text-[var(--text-muted)] px-1">+{dayPosts.length - 3} mas</span>
                )}
              </div>

              {/* Mobile: colored dots */}
              <div className="flex items-center gap-0.5 mt-0.5 md:hidden flex-wrap">
                {dayPosts.slice(0, 4).map((p) => (
                  <span key={p.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: platformColors[p.platform] }} />
                ))}
              </div>

              {/* Complete gold corner badge */}
              {complete && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-[var(--gold-primary)] border-l-[12px] border-l-transparent" />
              )}
            </button>
          );
        })}

        {/* Fill remaining cells in last row */}
        {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
          <div key={`trail-${i}`} className="border-r border-b border-[var(--border-color)] last:border-r-0 bg-[var(--bg-primary)]/60" />
        ))}
      </div>

      {/* ═══════════════ SIDE PANEL (Overlay) ═══════════════ */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/50 ${closing ? "opacity-0 transition-opacity duration-200" : "animate-overlay-in"}`}
            onClick={closePanel}
          />

          {/* Panel */}
          <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] md:w-[460px] bg-[var(--bg-secondary)] border-l border-[var(--border-color)] shadow-2xl shadow-black/40 flex flex-col ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}`}>

            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {selectedDay} de {MONTHS[month]}, {year}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {selectedPosts.length} publicacion{selectedPosts.length !== 1 ? "es" : ""} programada{selectedPosts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={closePanel} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">

              {/* If showing form */}
              {showForm ? (
                <div className="space-y-4 animate-fade-up">
                  <h4 className="text-sm font-semibold text-gold-gradient">
                    {editingPost ? "Editar Publicacion" : "Nueva Publicacion"}
                  </h4>

                  {/* Title */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Titulo</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Titulo del post"
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Descripcion</label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Describe el contenido..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none"
                    />
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Plataforma</label>
                    <div className="flex gap-2">
                      {(["instagram", "tiktok", "youtube"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setFormPlatform(p)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 justify-center ${
                            formPlatform === p
                              ? p === "instagram" ? "badge-instagram" : p === "tiktok" ? "badge-tiktok" : "badge-youtube"
                              : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-muted)]/30"
                          }`}
                        >
                          <PlatformIconSmall platform={p} className="w-4 h-4" />
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status + Time row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Estado</label>
                      <div className="flex flex-col gap-1.5">
                        {(["borrador", "listo", "publicado"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setFormStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                              formStatus === s
                                ? s === "borrador" ? "status-draft" : s === "listo" ? "status-ready" : "status-published"
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                            }`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Hora</label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          type="time"
                          value={formTime}
                          onChange={(e) => setFormTime(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={savePost}
                      disabled={!formTitle.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-[0.98]"
                    >
                      {editingPost ? "Guardar Cambios" : "Crear Publicacion"}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setEditingPost(null); }}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]/30 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Delete (only when editing) */}
                  {editingPost && (
                    <button
                      onClick={() => deletePost(editingPost.id)}
                      className="w-full py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Eliminar publicacion
                    </button>
                  )}
                </div>
              ) : (
                /* ── Post list for selected day ── */
                <>
                  {selectedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-up">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-3">
                        <span className="text-xl">📅</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] font-medium">Sin publicaciones</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Este dia esta libre</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPosts.map((post, idx) => (
                        <div
                          key={post.id}
                          className="animate-fade-up stagger flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-color)] hover:border-[var(--border-gold)] transition-all group/card"
                          style={{ "--i": idx } as React.CSSProperties}
                        >
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
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                post.status === "borrador" ? "status-draft" : post.status === "listo" ? "status-ready" : "status-published"
                              }`}>
                                {post.status}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(post.scheduledDate).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(post); }}
                            className="p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 hover:bg-[var(--gold-primary)]/10 text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all flex-shrink-0"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel Footer — New Post CTA */}
            {!showForm && (
              <div className="border-t border-[var(--border-color)] p-4 flex-shrink-0">
                <button
                  onClick={startNewPost}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-[0.98]"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nueva Publicacion
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
