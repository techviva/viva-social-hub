"use client";

import { platformMetrics } from "@/data/metrics";
import { InstagramIcon, TikTokIcon, YouTubeIcon, TrendUpIcon, TrendDownIcon, UsersIcon, HeartIcon, EyeIcon } from "./Icons";

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-[#4ade80]" : "text-[#f87171]"}`}>
      {positive ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
      {positive ? "+" : ""}{value}%
    </span>
  );
}

const platformConfig = {
  instagram: {
    name: "Instagram",
    icon: <InstagramIcon className="w-7 h-7" />,
    color: "#e1306c",
    gradient: "from-[#e1306c]/15 to-[#c13584]/5",
    borderColor: "rgba(225, 48, 108, 0.3)",
  },
  tiktok: {
    name: "TikTok",
    icon: <TikTokIcon className="w-7 h-7" />,
    color: "#00f2ea",
    gradient: "from-[#00f2ea]/10 to-[#00c4cc]/5",
    borderColor: "rgba(0, 242, 234, 0.25)",
  },
  youtube: {
    name: "YouTube",
    icon: <YouTubeIcon className="w-7 h-7" />,
    color: "#ff4444",
    gradient: "from-[#ff4444]/10 to-[#cc3333]/5",
    borderColor: "rgba(255, 68, 68, 0.25)",
  },
};

export default function MetricsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Metricas</h2>
        <p className="text-sm text-[var(--text-muted)]">Rendimiento por plataforma en los ultimos 30 dias</p>
      </div>

      {/* Platform Cards */}
      <div className="space-y-6">
        {platformMetrics.map((m) => {
          const config = platformConfig[m.platform];
          return (
            <div
              key={m.platform}
              className={`rounded-2xl border bg-gradient-to-br ${config.gradient} p-5 md:p-6 transition-all hover:shadow-lg`}
              style={{ borderColor: config.borderColor }}
            >
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: `${config.color}15`, color: config.color }}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: config.color }}>{config.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">Ultimos 30 dias</p>
                  </div>
                </div>
              </div>

              {/* Main Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Seguidores</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{formatNum(m.followers)}</p>
                  <TrendBadge value={m.followersChange} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <HeartIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Engagement</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{m.engagement}%</p>
                  <TrendBadge value={m.engagementChange} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <EyeIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Alcance</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{formatNum(m.reach)}</p>
                  <TrendBadge value={m.reachChange} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <EyeIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Impresiones</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{formatNum(m.impressions)}</p>
                  <TrendBadge value={m.impressionsChange} />
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Likes", value: m.likes },
                  { label: "Comentarios", value: m.comments },
                  { label: "Shares", value: m.shares },
                  { label: "Guardados", value: m.saves },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-[var(--bg-primary)]/40 border border-[var(--border-color)]">
                    <p className="text-lg md:text-xl font-bold text-[var(--text-primary)]">{formatNum(stat.value)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gold-gradient mb-4">Totales Combinados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Seguidores Totales", value: platformMetrics.reduce((a, m) => a + m.followers, 0) },
            { label: "Alcance Total", value: platformMetrics.reduce((a, m) => a + m.reach, 0) },
            { label: "Likes Totales", value: platformMetrics.reduce((a, m) => a + m.likes, 0) },
            { label: "Impresiones Totales", value: platformMetrics.reduce((a, m) => a + m.impressions, 0) },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gold-gradient">{formatNum(stat.value)}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
