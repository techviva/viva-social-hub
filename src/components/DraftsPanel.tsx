"use client";

import { useState } from "react";
import { TrashIcon, CalendarIcon, CopyIcon, InstagramIcon, TikTokIcon, YouTubeIcon, EditIcon, XIcon } from "./Icons";
import type { DraftPost } from "./AIPostCreator";
import type { Platform } from "@/data/posts";

interface DraftsPanelProps {
  drafts: DraftPost[];
  onDelete: (id: string) => void;
  onSchedule: (draft: DraftPost) => void;
}

function PlatformBadge({ platform }: { platform: Platform }) {
  if (platform === "instagram") return <span className="badge-instagram inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><InstagramIcon className="w-3 h-3" />IG</span>;
  if (platform === "tiktok") return <span className="badge-tiktok inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><TikTokIcon className="w-3 h-3" />TT</span>;
  return <span className="badge-youtube inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><YouTubeIcon className="w-3 h-3" />YT</span>;
}

function TextOverlay({ headline, subline, ctaText }: { headline?: string; subline?: string; ctaText?: string }) {
  if (!headline) return null;
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-5 pointer-events-none">
      <div className="bg-gradient-to-t from-black/70 via-black/30 to-transparent absolute inset-0" />
      <div className="relative z-10">
        <div className="w-8 h-[2px] bg-[#d4a843] mb-2 rounded-full" />
        <p className="text-white font-bold text-sm leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{headline}</p>
        {subline && <p className="text-white/70 text-[10px] mt-1 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{subline}</p>}
        {ctaText && <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-[#d4a843] text-black text-[8px] font-bold rounded-full uppercase tracking-wider">{ctaText}</span>}
      </div>
    </div>
  );
}

export default function DraftsPanel({ drafts, onDelete, onSchedule }: DraftsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fullscreenDraft, setFullscreenDraft] = useState<DraftPost | null>(null);

  const copyCaption = (caption: string, hashtags: string) => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Borradores</h2>
        <p className="text-sm text-[var(--text-muted)]">Posts generados con AI listos para programar</p>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gold-primary)]/10 to-[var(--bg-card)] border border-[var(--border-gold)] flex items-center justify-center mb-4">
            <EditIcon className="w-8 h-8 text-[var(--gold-light)]" />
          </div>
          <p className="text-[var(--text-secondary)] font-semibold text-base">Sin borradores</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Usa &ldquo;Crear con AI&rdquo; en el header para generar tu primer post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">{drafts.length} borrador{drafts.length !== 1 ? "es" : ""}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft, idx) => (
              <div
                key={draft.id}
                className="animate-fade-up stagger rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 overflow-hidden hover:border-[var(--border-gold)] hover:shadow-lg hover:shadow-[var(--gold-primary)]/5 transition-all group"
                style={{ "--i": idx } as React.CSSProperties}
              >
                {/* Image with text overlay */}
                {draft.image && (
                  <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setFullscreenDraft(draft)}>
                    <img src={draft.image} alt={draft.title} className="w-full h-full object-cover" />
                    <TextOverlay headline={draft.headline} />
                    <div className="absolute top-2 left-2"><PlatformBadge platform={draft.platform} /></div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md status-draft">Borrador</span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white/60">Toca para ampliar</div>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{draft.title || draft.headline}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(draft.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {" · "}{draft.editStyle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>

                  {expanded === draft.id && (
                    <div className="animate-fade-up rounded-lg bg-[var(--bg-primary)]/50 p-2 space-y-1">
                      <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">{draft.caption}</p>
                      <p className="text-[9px] text-[var(--text-muted)]">{draft.hashtags}</p>
                    </div>
                  )}

                  <button onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                    className="text-[10px] text-[var(--gold-light)] hover:underline">
                    {expanded === draft.id ? "Ocultar caption" : "Ver caption"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onSchedule(draft)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] text-[11px] font-semibold transition-all active:scale-95">
                      <CalendarIcon className="w-3 h-3" />Programar
                    </button>
                    <button onClick={() => copyCaption(draft.caption, draft.hashtags)}
                      className="p-1.5 rounded-lg hover:bg-[var(--gold-primary)]/10 text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all" title="Copiar">
                      <CopyIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(draft.id)}
                      className="p-1.5 rounded-lg hover:bg-red-400/10 text-[var(--text-muted)] hover:text-red-400 transition-all" title="Eliminar">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Fullscreen Modal ═══ */}
      {fullscreenDraft && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-overlay-in" onClick={() => setFullscreenDraft(null)}>
          <button onClick={() => setFullscreenDraft(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10">
            <XIcon className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row gap-4 max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative flex-shrink-0 md:w-[55%] aspect-square rounded-2xl overflow-hidden">
              <img src={fullscreenDraft.image} alt="" className="w-full h-full object-cover" />
              {fullscreenDraft.headline && (
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                  <div className="bg-gradient-to-t from-black/70 via-black/30 to-transparent absolute inset-0" />
                  <div className="relative z-10">
                    <div className="w-12 h-[2px] bg-[#d4a843] mb-3 rounded-full" />
                    <p className="text-white font-bold text-xl md:text-3xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{fullscreenDraft.headline}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details sidebar */}
            <div className="flex-1 overflow-y-auto md:py-4 space-y-4">
              <div>
                <PlatformBadge platform={fullscreenDraft.platform} />
                <h3 className="text-lg font-bold text-white mt-2">{fullscreenDraft.title || fullscreenDraft.headline}</h3>
                <p className="text-xs text-white/40 mt-1">
                  {new Date(fullscreenDraft.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · "}{fullscreenDraft.editStyle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[#d4a843] font-semibold">Caption</p>
                <p className="text-sm text-white/90 whitespace-pre-line leading-relaxed">{fullscreenDraft.caption}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#d4a843] font-semibold mb-1">Hashtags</p>
                <p className="text-xs text-white/50 leading-relaxed">{fullscreenDraft.hashtags}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { onSchedule(fullscreenDraft); setFullscreenDraft(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#b8922e] to-[#d4a843] text-black font-semibold text-sm transition-all active:scale-95">
                  <CalendarIcon className="w-4 h-4" />Programar
                </button>
                <button onClick={() => { copyCaption(fullscreenDraft.caption, fullscreenDraft.hashtags); }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
