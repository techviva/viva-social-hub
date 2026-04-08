"use client";

import { platformMetrics, dailyMetrics, bestPostOfWeek, platformComparison } from "@/data/metrics";
import {
  InstagramIcon, TikTokIcon, YouTubeIcon,
  TrendUpIcon, TrendDownIcon,
  UsersIcon, HeartIcon, EyeIcon, FireIcon,
} from "./Icons";

/* ── helpers ── */

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function Trend({ value, large }: { value: number; large?: boolean }) {
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${large ? "text-sm" : "text-xs"} ${up ? "text-[#4ade80]" : "text-[#f87171]"}`}>
      {up ? <TrendUpIcon className={large ? "w-4 h-4" : "w-3.5 h-3.5"} /> : <TrendDownIcon className={large ? "w-4 h-4" : "w-3.5 h-3.5"} />}
      {up ? "+" : ""}{value}%
    </span>
  );
}

/* ── sparkline inside hero cards ── */

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7 opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} className="animate-draw-line" />
    </svg>
  );
}

/* ── Component ── */

export default function MetricsPanel() {
  const totalFollowers = platformMetrics.reduce((a, m) => a + m.followers, 0);
  const avgEngagement = Math.round(platformMetrics.reduce((a, m) => a + m.engagement, 0) / platformMetrics.length * 10) / 10;
  const totalViews = platformMetrics.reduce((a, m) => a + m.impressions, 0);
  const followersChange = Math.round(platformMetrics.reduce((a, m) => a + m.followersChange, 0) / platformMetrics.length * 10) / 10;
  const engagementChange = Math.round(platformMetrics.reduce((a, m) => a + m.engagementChange, 0) / platformMetrics.length * 10) / 10;
  const viewsChange = Math.round(platformMetrics.reduce((a, m) => a + m.impressionsChange, 0) / platformMetrics.length * 10) / 10;

  /* 30-day chart geometry */
  const chartW = 560;
  const chartH = 220;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const viewsData = dailyMetrics.map((d) => d.views);
  const followersData = dailyMetrics.map((d) => d.followers);
  const vMax = Math.max(...viewsData) * 1.1;
  const fMax = Math.max(...followersData) * 1.05;
  const fMin = Math.min(...followersData) * 0.95;

  function toPoint(arr: number[], max: number, min: number, i: number) {
    const x = padL + (i / (arr.length - 1)) * plotW;
    const y = padT + plotH - ((arr[i] - min) / (max - min)) * plotH;
    return { x, y };
  }

  const viewsLine = viewsData.map((_, i) => toPoint(viewsData, vMax, 0, i));
  const followersLine = followersData.map((_, i) => toPoint(followersData, fMax, fMin, i));

  function polyline(pts: { x: number; y: number }[]) {
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  }
  function areaPath(pts: { x: number; y: number }[]) {
    const base = padT + plotH;
    return `M${pts[0].x},${base} ` + pts.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length - 1].x},${base}Z`;
  }

  /* bar chart max per metric */
  const barMax = Math.max(
    ...platformComparison.map((r) => Math.max(r.instagram, r.tiktok, r.youtube))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="animate-fade-up stagger" style={{ "--i": 0 } as React.CSSProperties}>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Metricas</h2>
        <p className="text-sm text-[var(--text-muted)]">Rendimiento consolidado &mdash; ultimos 30 dias</p>
      </div>

      {/* ═══════════════ 4 HERO CARDS ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* 1 — Seguidores Totales */}
        <div className="animate-fade-up stagger animate-glow-pulse rounded-2xl p-5 border border-[var(--border-accent)] bg-gradient-to-br from-[var(--accent-leaf)]/8 to-[var(--bg-card)]" style={{ "--i": 1 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[var(--accent-leaf)]/10">
              <UsersIcon className="w-5 h-5 text-[var(--viva-green-bright)]" />
            </div>
            <MiniSparkline data={dailyMetrics.map((d) => d.followers)} color="var(--viva-green-bright)" />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Seguidores Totales</p>
          <p className="text-4xl md:text-5xl font-extrabold text-gold-gradient animate-count-pulse">{fmt(totalFollowers)}</p>
          <div className="mt-2"><Trend value={followersChange} large /></div>
        </div>

        {/* 2 — Interaccion Promedio */}
        <div className="animate-fade-up stagger rounded-2xl p-5 border border-[rgba(99,102,241,0.25)] bg-gradient-to-br from-[#6366f1]/8 to-[var(--bg-card)]" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#6366f1]/10">
              <HeartIcon className="w-5 h-5 text-[#a5b4fc]" />
            </div>
            <MiniSparkline data={dailyMetrics.map((d) => d.engagement)} color="#a5b4fc" />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Interaccion Promedio</p>
          <p className="text-4xl md:text-5xl font-extrabold text-[#c7d2fe] animate-count-pulse">{avgEngagement}%</p>
          <div className="mt-2"><Trend value={engagementChange} large /></div>
        </div>

        {/* 3 — Visualizaciones del Mes */}
        <div className="animate-fade-up stagger rounded-2xl p-5 border border-[rgba(34,197,94,0.25)] bg-gradient-to-br from-[#22c55e]/8 to-[var(--bg-card)]" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-[#22c55e]/10">
              <EyeIcon className="w-5 h-5 text-[#86efac]" />
            </div>
            <MiniSparkline data={dailyMetrics.map((d) => d.views)} color="#86efac" />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Visualizaciones del Mes</p>
          <p className="text-4xl md:text-5xl font-extrabold text-[#bbf7d0] animate-count-pulse">{fmt(totalViews)}</p>
          <div className="mt-2"><Trend value={viewsChange} large /></div>
        </div>

        {/* 4 — Mejor Post de la Semana */}
        <div className="animate-fade-up stagger rounded-2xl overflow-hidden border border-[var(--border-accent)] bg-gradient-to-br from-[var(--accent-leaf)]/5 to-[var(--bg-card)] relative group" style={{ "--i": 4 } as React.CSSProperties}>
          <div className="absolute inset-0">
            <img src={bestPostOfWeek.image} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/80 to-transparent" />
          </div>
          <div className="relative p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-[var(--accent-leaf)]/10">
                <FireIcon className="w-5 h-5 text-[var(--viva-green-bright)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--viva-green-bright)] font-semibold">Mejor Post</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1 line-clamp-2">{bestPostOfWeek.title}</p>
            <div className="flex items-center gap-1 mb-auto">
              <span className="badge-tiktok text-[10px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                <TikTokIcon className="w-3 h-3" />TikTok
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gold-gradient">{fmt(bestPostOfWeek.likes)}</p>
                <p className="text-[9px] text-[var(--text-muted)]">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gold-gradient">{fmt(bestPostOfWeek.reach)}</p>
                <p className="text-[9px] text-[var(--text-muted)]">Alcance</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gold-gradient">{bestPostOfWeek.engagementRate}%</p>
                <p className="text-[9px] text-[var(--text-muted)]">Engage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CHARTS ROW ═══════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* ── 30-Day Line Chart ── */}
        <div className="xl:col-span-3 animate-fade-up stagger rounded-2xl p-5 border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-card)]/80 to-[var(--bg-secondary)]" style={{ "--i": 5 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Crecimiento 30 Dias</h3>
              <p className="text-xs text-[var(--text-muted)]">Visualizaciones y seguidores diarios</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded-full bg-[var(--viva-green-bright)]" />Seguidores</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 rounded-full bg-[#86efac]" />Views</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full min-w-[400px] h-auto" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--viva-green-bright)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--viva-green-bright)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86efac" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Horizontal grid */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = padT + (plotH / 4) * i;
                return (
                  <g key={`g-${i}`}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4,6" />
                  </g>
                );
              })}

              {/* X labels — every 5th day */}
              {dailyMetrics.filter((_, i) => i % 5 === 0).map((d, idx) => {
                const i = idx * 5;
                const x = padL + (i / (dailyMetrics.length - 1)) * plotW;
                return <text key={d.day} x={x} y={chartH - 6} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{d.label}</text>;
              })}

              {/* Views area + line */}
              <path d={areaPath(viewsLine)} fill="url(#greenArea)" className="animate-fill-area" style={{ animationDelay: "0.3s" }} />
              <polyline points={polyline(viewsLine)} fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" style={{ animationDelay: "0.2s" }} />

              {/* Followers area + line */}
              <path d={areaPath(followersLine)} fill="url(#goldArea)" className="animate-fill-area" style={{ animationDelay: "0.5s" }} />
              <polyline points={polyline(followersLine)} fill="none" stroke="var(--viva-green-bright)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="animate-draw-line" style={{ animationDelay: "0.4s" }} />

              {/* Dots on followers — every 5th */}
              {followersLine.filter((_, i) => i % 5 === 0).map((p, idx) => (
                <circle key={`fd-${idx}`} cx={p.x} cy={p.y} r="4" fill="var(--viva-green-bright)" stroke="var(--bg-card)" strokeWidth="2" className="animate-dot-pop" style={{ animationDelay: `${0.8 + idx * 0.1}s` }} />
              ))}

              {/* Dots on views — every 5th */}
              {viewsLine.filter((_, i) => i % 5 === 0).map((p, idx) => (
                <circle key={`vd-${idx}`} cx={p.x} cy={p.y} r="3.5" fill="#86efac" stroke="var(--bg-card)" strokeWidth="2" className="animate-dot-pop" style={{ animationDelay: `${0.9 + idx * 0.1}s` }} />
              ))}
            </svg>
          </div>
        </div>

        {/* ── Bar Chart: Platform Comparison ── */}
        <div className="xl:col-span-2 animate-fade-up stagger rounded-2xl p-5 border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-card)]/80 to-[var(--bg-secondary)]" style={{ "--i": 6 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Comparativa</h3>
              <p className="text-xs text-[var(--text-muted)]">Rendimiento por plataforma</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#e1306c]" />IG</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#00f2ea]" />TT</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#ff4444]" />YT</span>
            </div>
          </div>

          <div className="space-y-5">
            {platformComparison.map((row, ri) => (
              <div key={row.metric} className="animate-fade-left stagger" style={{ "--i": ri + 7 } as React.CSSProperties}>
                <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">{row.metric}</p>
                <div className="space-y-1.5">
                  {([
                    { key: "instagram" as const, color: "#e1306c", label: "IG" },
                    { key: "tiktok" as const,    color: "#00f2ea", label: "TT" },
                    { key: "youtube" as const,   color: "#ff4444", label: "YT" },
                  ]).map((p) => {
                    const val = row[p.key] as number;
                    const pct = (val / row.max) * 100;
                    return (
                      <div key={p.key} className="flex items-center gap-2">
                        <span className="text-[10px] w-4 text-right text-[var(--text-muted)]">{p.label}</span>
                        <div className="flex-1 h-5 rounded-md bg-[var(--bg-secondary)] overflow-hidden relative">
                          <div
                            className="h-full rounded-md animate-bar-grow"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${p.color}40, ${p.color})`,
                              animationDelay: `${0.3 + ri * 0.15 + (p.key === "tiktok" ? 0.05 : p.key === "youtube" ? 0.1 : 0)}s`,
                            }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[var(--text-primary)] drop-shadow-sm">
                            {row.metric === "Engagement %" ? `${val}%` : fmt(val)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ PLATFORM DETAIL CARDS ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformMetrics.map((m, mi) => {
          const cfg = {
            instagram: { name: "Instagram", icon: <InstagramIcon className="w-6 h-6" />, color: "#e1306c", border: "rgba(225,48,108,0.3)", grad: "from-[#e1306c]/10 to-[var(--bg-card)]" },
            tiktok:    { name: "TikTok",    icon: <TikTokIcon className="w-6 h-6" />,    color: "#00f2ea", border: "rgba(0,242,234,0.25)",  grad: "from-[#00f2ea]/8 to-[var(--bg-card)]" },
            youtube:   { name: "YouTube",   icon: <YouTubeIcon className="w-6 h-6" />,   color: "#ff4444", border: "rgba(255,68,68,0.25)",   grad: "from-[#ff4444]/8 to-[var(--bg-card)]" },
          }[m.platform];

          return (
            <div
              key={m.platform}
              className={`animate-fade-up stagger rounded-2xl p-5 border bg-gradient-to-br ${cfg.grad}`}
              style={{ borderColor: cfg.border, "--i": 12 + mi } as React.CSSProperties}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ background: `${cfg.color}15`, color: cfg.color }}>{cfg.icon}</div>
                <div>
                  <h4 className="text-base font-bold" style={{ color: cfg.color }}>{cfg.name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Ultimos 30 dias</p>
                </div>
              </div>

              {/* Big number + trend */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Seguidores</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-[var(--text-primary)] animate-count-pulse" style={{ animationDelay: `${0.2 + mi * 0.15}s` }}>
                    {fmt(m.followers)}
                  </span>
                  <Trend value={m.followersChange} large />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Engagement", value: `${m.engagement}%`, change: m.engagementChange },
                  { label: "Alcance", value: fmt(m.reach), change: m.reachChange },
                  { label: "Likes", value: fmt(m.likes), change: null },
                  { label: "Comentarios", value: fmt(m.comments), change: null },
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)]">
                    <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{s.label}</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{s.value}</p>
                    {s.change !== null && <Trend value={s.change} />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
