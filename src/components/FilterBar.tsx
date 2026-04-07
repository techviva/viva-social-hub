"use client";

import { InstagramIcon, TikTokIcon, YouTubeIcon, GridIcon, ListIcon } from "./Icons";
import type { Platform, PostStatus } from "@/data/posts";

interface FilterBarProps {
  activePlatform: Platform | "all";
  onPlatformChange: (p: Platform | "all") => void;
  activeStatus: PostStatus | "all";
  onStatusChange: (s: PostStatus | "all") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (m: "grid" | "list") => void;
}

const platforms: { key: Platform | "all"; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "Todas" },
  { key: "instagram", label: "Instagram", icon: <InstagramIcon className="w-4 h-4" /> },
  { key: "tiktok", label: "TikTok", icon: <TikTokIcon className="w-4 h-4" /> },
  { key: "youtube", label: "YouTube", icon: <YouTubeIcon className="w-4 h-4" /> },
];

const statuses: { key: PostStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "borrador", label: "Borrador" },
  { key: "listo", label: "Listo" },
  { key: "publicado", label: "Publicado" },
];

export default function FilterBar({
  activePlatform,
  onPlatformChange,
  activeStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Platform Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => onPlatformChange(p.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePlatform === p.key
                ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => onStatusChange(s.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStatus === s.key
                  ? s.key === "borrador"
                    ? "status-draft"
                    : s.key === "listo"
                    ? "status-ready"
                    : s.key === "publicado"
                    ? "status-published"
                    : "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
