"use client";

import { InstagramIcon, TikTokIcon, YouTubeIcon, CalendarIcon } from "./Icons";
import type { Post } from "@/data/posts";

function PlatformBadge({ platform }: { platform: Post["platform"] }) {
  const config = {
    instagram: { icon: <InstagramIcon className="w-3.5 h-3.5" />, className: "badge-instagram" },
    tiktok: { icon: <TikTokIcon className="w-3.5 h-3.5" />, className: "badge-tiktok" },
    youtube: { icon: <YouTubeIcon className="w-3.5 h-3.5" />, className: "badge-youtube" },
  };
  const c = config[platform as keyof typeof config] || config.instagram;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${c.className}`}>
      {c.icon}
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  const cls =
    status === "borrador"
      ? "status-draft"
      : status === "listo"
      ? "status-ready"
      : "status-published";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export function PostCardGrid({ post }: { post: Post }) {
  return (
    <div className="card-glass rounded-2xl overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <PlatformBadge platform={post.platform} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={post.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
          {post.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent-leaf)]" />
          <span>{formatDate(post.scheduledDate)}</span>
          <span className="text-[var(--text-muted)]">-</span>
          <span>{formatTime(post.scheduledDate)}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostCardList({ post }: { post: Post }) {
  return (
    <div className="card-glass rounded-xl overflow-hidden group cursor-pointer flex">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-between p-3 md:p-4 gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {post.title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {post.description}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1.5">
            <CalendarIcon className="w-3 h-3 text-[var(--accent-leaf)]" />
            <span>{formatDate(post.scheduledDate)}</span>
            <span className="text-[var(--text-muted)]">-</span>
            <span>{formatTime(post.scheduledDate)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <PlatformBadge platform={post.platform} />
          <StatusBadge status={post.status} />
        </div>
      </div>
    </div>
  );
}
