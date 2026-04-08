"use client";

import { posts } from "@/data/posts";
import { followerHistory, topPosts } from "@/data/metrics";
import { InstagramIcon, TikTokIcon, YouTubeIcon, CalendarIcon, TrendUpIcon, FireIcon, HeartIcon, EyeIcon } from "./Icons";
import type { Platform } from "@/data/posts";

function PlatformIcon({ platform, className = "w-3.5 h-3.5" }: { platform: Platform; className?: string }) {
  if (platform === "instagram") return <InstagramIcon className={className} />;
  if (platform === "tiktok") return <TikTokIcon className={className} />;
  return <YouTubeIcon className={className} />;
}

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export default function DashboardPanel() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const weekPosts = posts.filter((p) => {
    const d = new Date(p.scheduledDate);
    return d >= startOfWeek && d < endOfWeek;
  });

  const weekDrafts = weekPosts.filter((p) => p.status === "borrador").length;
  const weekReady = weekPosts.filter((p) => p.status === "listo").length;
  const weekPublished = weekPosts.filter((p) => p.status === "publicado").length;

  const chartMax = Math.max(...followerHistory.flatMap((d) => [d.instagram, d.tiktok, d.youtube]));

  return (
    <div className="space-y-6">
      {/* Welcome & Week Summary */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)]">Weekly summary and performance</p>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Posts this week", value: weekPosts.length, color: "var(--accent-leaf)", icon: <CalendarIcon className="w-4 h-4" /> },
          { label: "Drafts", value: weekDrafts, color: "var(--status-draft)", icon: <span className="w-4 h-4 flex items-center justify-center text-xs">~</span> },
          { label: "Ready", value: weekReady, color: "var(--status-ready)", icon: <TrendUpIcon className="w-4 h-4" /> },
          { label: "Published", value: weekPublished, color: "var(--status-published)", icon: <FireIcon className="w-4 h-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="card-glass rounded-xl p-4 stat-glow">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-[var(--bg-secondary)]" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Follower Growth Chart */}
        <div className="lg:col-span-2 card-glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Follower Growth</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#e1306c]" />IG</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00f2ea]" />TT</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff4444]" />YT</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full overflow-hidden">
            <svg viewBox="0 0 500 200" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e1306c" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#e1306c" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2ea" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00f2ea" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ff4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="40" y1={20 + i * 40} x2="480" y2={20 + i * 40} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4,4" />
              ))}

              {/* Month labels */}
              {followerHistory.map((d, i) => (
                <text key={d.month} x={40 + i * 88} y="195" fill="var(--text-muted)" fontSize="10" textAnchor="middle">{d.month}</text>
              ))}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => (
                <text key={i} x="30" y={24 + i * 40} fill="var(--text-muted)" fontSize="9" textAnchor="end">
                  {formatNum(Math.round(chartMax * (1 - i / 4)))}
                </text>
              ))}

              {/* Instagram line + area */}
              <path d={followerHistory.map((d, i) => `${i === 0 ? "M" : "L"}${40 + i * 88},${180 - (d.instagram / chartMax) * 160}`).join(" ") + `L${40 + 5 * 88},180L40,180Z`} fill="url(#igGrad)" />
              <polyline fill="none" stroke="#e1306c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points={followerHistory.map((d, i) => `${40 + i * 88},${180 - (d.instagram / chartMax) * 160}`).join(" ")} />
              {followerHistory.map((d, i) => (
                <circle key={`ig-${i}`} cx={40 + i * 88} cy={180 - (d.instagram / chartMax) * 160} r="3" fill="#e1306c" />
              ))}

              {/* TikTok line + area */}
              <path d={followerHistory.map((d, i) => `${i === 0 ? "M" : "L"}${40 + i * 88},${180 - (d.tiktok / chartMax) * 160}`).join(" ") + `L${40 + 5 * 88},180L40,180Z`} fill="url(#ttGrad)" />
              <polyline fill="none" stroke="#00f2ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points={followerHistory.map((d, i) => `${40 + i * 88},${180 - (d.tiktok / chartMax) * 160}`).join(" ")} />
              {followerHistory.map((d, i) => (
                <circle key={`tt-${i}`} cx={40 + i * 88} cy={180 - (d.tiktok / chartMax) * 160} r="3" fill="#00f2ea" />
              ))}

              {/* YouTube line + area */}
              <path d={followerHistory.map((d, i) => `${i === 0 ? "M" : "L"}${40 + i * 88},${180 - (d.youtube / chartMax) * 160}`).join(" ") + `L${40 + 5 * 88},180L40,180Z`} fill="url(#ytGrad)" />
              <polyline fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points={followerHistory.map((d, i) => `${40 + i * 88},${180 - (d.youtube / chartMax) * 160}`).join(" ")} />
              {followerHistory.map((d, i) => (
                <circle key={`yt-${i}`} cx={40 + i * 88} cy={180 - (d.youtube / chartMax) * 160} r="3" fill="#ff4444" />
              ))}
            </svg>
          </div>
        </div>

        {/* Top Posts */}
        <div className="card-glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <FireIcon className="w-4 h-4 text-[var(--accent-leaf)]" />
            Top Posts
          </h3>
          <div className="space-y-3">
            {topPosts.map((post, idx) => (
              <div key={post.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-card)]/50 transition-all">
                <div className="relative flex-shrink-0">
                  <img src={post.image} alt={post.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[var(--accent-leaf)] flex items-center justify-center text-[10px] font-bold text-[var(--bg-primary)]">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <PlatformIcon platform={post.platform} className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)] capitalize">{post.platform}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)]">
                      <HeartIcon className="w-3 h-3" />{formatNum(post.likes)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)]">
                      <EyeIcon className="w-3 h-3" />{formatNum(post.reach)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming posts this week */}
      <div className="card-glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upcoming this week</h3>
        {weekPosts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No posts scheduled this week</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weekPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                <img src={post.image} alt={post.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PlatformIcon platform={post.platform} className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(post.scheduledDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      post.status === "borrador" ? "status-draft" : post.status === "listo" ? "status-ready" : "status-published"
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
