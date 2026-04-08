"use client";

import { useState } from "react";
import { TrashIcon, CalendarIcon, CopyIcon, InstagramIcon, TikTokIcon, YouTubeIcon, EditIcon, XIcon } from "./Icons";
import { getTemplateById, POST_TEMPLATES, DEFAULT_VARIATION } from "@/lib/post-templates";
import PostRenderer from "./PostRenderer";
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
  const [fullscreenDraft, setFullscreenDraft] = useState<DraftPost | null>(null);

  const copyCaption = (caption: string, hashtags: string) => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Drafts</h2>
        <p className="text-sm text-[var(--text-muted)]">AI-generated posts ready to schedule</p>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-leaf)]/10 to-[var(--bg-card)] border border-[var(--border-accent)] flex items-center justify-center mb-4">
            <EditIcon className="w-8 h-8 text-[var(--viva-green-bright)]" />
          </div>
          <p className="text-[var(--text-secondary)] font-semibold text-base">No drafts yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Use &ldquo;Create with AI&rdquo; in the header to generate your first post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">{drafts.length} draft{drafts.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft, idx) => {
              const tpl = getTemplateById(draft.templateId) || POST_TEMPLATES[0];
              return (
                <div key={draft.id} className="animate-fade-up stagger rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 overflow-hidden hover:border-[var(--border-accent)] hover:shadow-lg hover:shadow-[var(--accent-leaf)]/5 transition-all group" style={{ "--i": idx } as React.CSSProperties}>
                  {/* Rendered preview */}
                  <div className="relative cursor-pointer" onClick={() => setFullscreenDraft(draft)}>
                    <PostRenderer template={tpl} variation={draft.variation || DEFAULT_VARIATION} imageUrl={draft.image} headline={draft.headline} subline={draft.subline} cta={draft.ctaText} />
                    <div className="absolute top-2 left-2 z-10"><PlatformBadge platform={draft.platform} /></div>
                    <div className="absolute top-2 right-2 z-10"><span className="text-[10px] px-1.5 py-0.5 rounded-md status-draft">Draft</span></div>
                    <div className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white/60">Expand</div>
                  </div>

                  <div className="p-3 space-y-2">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{draft.title || draft.headline}</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {new Date(draft.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{tpl.name}
                    </p>
                    <button onClick={() => setExpanded(expanded === draft.id ? null : draft.id)} className="text-[10px] text-[var(--viva-green-bright)] hover:underline">
                      {expanded === draft.id ? "Hide" : "Show caption"}
                    </button>
                    {expanded === draft.id && (
                      <div className="animate-fade-up rounded-lg bg-[var(--bg-primary)]/50 p-2 space-y-1">
                        <p className="text-xs text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">{draft.caption}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{draft.hashtags}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onSchedule(draft)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] text-[11px] font-semibold transition-all active:scale-95">
                        <CalendarIcon className="w-3 h-3" />Schedule
                      </button>
                      <button onClick={() => copyCaption(draft.caption, draft.hashtags)} className="p-1.5 rounded-lg hover:bg-[var(--accent-leaf)]/10 text-[var(--text-muted)] hover:text-[var(--viva-green-bright)] transition-all"><CopyIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(draft.id)} className="p-1.5 rounded-lg hover:bg-red-400/10 text-[var(--text-muted)] hover:text-red-400 transition-all"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {fullscreenDraft && (() => {
        const tpl = getTemplateById(fullscreenDraft.templateId) || POST_TEMPLATES[0];
        return (
          <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-overlay-in" onClick={() => setFullscreenDraft(null)}>
            <button onClick={() => setFullscreenDraft(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"><XIcon className="w-6 h-6" /></button>
            <div className="flex flex-col md:flex-row gap-4 max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex-shrink-0 md:w-[55%] rounded-2xl overflow-hidden">
                <PostRenderer template={tpl} variation={fullscreenDraft.variation || DEFAULT_VARIATION} imageUrl={fullscreenDraft.image} headline={fullscreenDraft.headline} subline={fullscreenDraft.subline} cta={fullscreenDraft.ctaText} />
              </div>
              <div className="flex-1 overflow-y-auto md:py-4 space-y-4">
                <div><PlatformBadge platform={fullscreenDraft.platform} /><h3 className="text-lg font-bold text-white mt-2">{fullscreenDraft.title || fullscreenDraft.headline}</h3><p className="text-xs text-white/40 mt-1">{new Date(fullscreenDraft.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · {tpl.name}</p></div>
                <div className="rounded-xl bg-white/5 p-4 space-y-2"><p className="text-[10px] uppercase tracking-wider text-[#7ab82e] font-semibold">Caption</p><p className="text-sm text-white/90 whitespace-pre-line leading-relaxed">{fullscreenDraft.caption}</p></div>
                <div className="rounded-xl bg-white/5 p-4"><p className="text-[10px] uppercase tracking-wider text-[#7ab82e] font-semibold mb-1">Hashtags</p><p className="text-xs text-white/50">{fullscreenDraft.hashtags}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => { onSchedule(fullscreenDraft); setFullscreenDraft(null); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#3c4a30] to-[#7ab82e] text-black font-semibold text-sm transition-all"><CalendarIcon className="w-4 h-4" />Schedule</button>
                  <button onClick={() => copyCaption(fullscreenDraft.caption, fullscreenDraft.hashtags)} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all"><CopyIcon className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
