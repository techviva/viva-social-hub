"use client";

import { posts } from "@/data/posts";

export default function StatsBar() {
  const total = posts.length;
  const drafts = posts.filter((p) => p.status === "borrador").length;
  const ready = posts.filter((p) => p.status === "listo").length;
  const published = posts.filter((p) => p.status === "publicado").length;

  const stats = [
    { label: "Total Posts", value: total, color: "var(--accent-leaf)" },
    { label: "Borradores", value: drafts, color: "var(--status-draft)" },
    { label: "Listos", value: ready, color: "var(--status-ready)" },
    { label: "Publicados", value: published, color: "var(--status-published)" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-glass rounded-xl p-4 stat-glow"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {stat.label}
          </p>
          <p
            className="text-2xl md:text-3xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
