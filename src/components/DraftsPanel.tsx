"use client";

import { useState } from "react";
import { TrashIcon, CalendarIcon, CopyIcon, InstagramIcon, TikTokIcon, YouTubeIcon, EditIcon } from "./Icons";
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

export default function DraftsPanel({ drafts, onDelete, onSchedule }: DraftsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

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
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Usa el boton &ldquo;Crear con AI&rdquo; en el header para generar tu primer post y guardarlo como borrador.</p>
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
                {/* Image */}
                {draft.image && (
                  <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}>
                    <img src={draft.image} alt={draft.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2"><PlatformBadge platform={draft.platform} /></div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md status-draft">Borrador</span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{draft.title || draft.headline}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(draft.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {draft.editStyle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>

                  {/* Expanded caption */}
                  {expanded === draft.id && (
                    <div className="animate-fade-up rounded-lg bg-[var(--bg-primary)]/50 p-2 space-y-1">
                      <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">{draft.caption}</p>
                      <p className="text-[9px] text-[var(--text-muted)]">{draft.hashtags}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onSchedule(draft)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] text-[11px] font-semibold transition-all active:scale-95">
                      <CalendarIcon className="w-3 h-3" />Programar
                    </button>
                    <button onClick={() => copyCaption(draft.caption, draft.hashtags)}
                      className="p-1.5 rounded-lg hover:bg-[var(--gold-primary)]/10 text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all" title="Copiar caption">
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
    </div>
  );
}
