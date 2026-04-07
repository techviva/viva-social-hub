"use client";

import { useState } from "react";
import { posts } from "@/data/posts";
import { ChevronLeftIcon, ChevronRightIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "./Icons";
import type { Platform } from "@/data/posts";

function PlatformDot({ platform }: { platform: Platform }) {
  const colors = { instagram: "#e1306c", tiktok: "#00f2ea", youtube: "#ff4444" };
  return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[platform] }} />;
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "instagram") return <InstagramIcon className="w-3 h-3" />;
  if (platform === "tiktok") return <TikTokIcon className="w-3 h-3" />;
  return <YouTubeIcon className="w-3 h-3" />;
}

const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDay: Record<number, typeof posts> = {};
  posts.forEach((post) => {
    const d = new Date(post.scheduledDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedPosts = selectedDay ? postsByDay[selectedDay] || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Calendario</h2>
        <p className="text-sm text-[var(--text-muted)]">Vista mensual de tus publicaciones programadas</p>
      </div>

      <div className="card-glass rounded-2xl p-4 md:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gold-gradient">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = postsByDay[day] || [];
            const isSelected = selectedDay === day;
            const hasToday = isToday(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative ${
                  isSelected
                    ? "bg-[var(--gold-primary)]/15 border border-[var(--border-gold)] ring-1 ring-[var(--gold-primary)]/20"
                    : dayPosts.length > 0
                    ? "hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)]"
                    : "border border-transparent"
                }`}
              >
                <span className={`text-xs font-medium mt-0.5 ${
                  hasToday
                    ? "w-5 h-5 rounded-full bg-[var(--gold-primary)] text-[var(--bg-primary)] flex items-center justify-center text-[10px]"
                    : isSelected
                    ? "text-[var(--gold-light)]"
                    : "text-[var(--text-secondary)]"
                }`}>
                  {day}
                </span>
                {dayPosts.length > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayPosts.slice(0, 3).map((p) => (
                      <PlatformDot key={p.id} platform={p.platform} />
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[8px] text-[var(--text-muted)]">+{dayPosts.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="card-glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {selectedDay} de {MONTHS[month]} &mdash; {selectedPosts.length} publicacion{selectedPosts.length !== 1 ? "es" : ""}
          </h3>
          {selectedPosts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin publicaciones este dia</p>
          ) : (
            <div className="space-y-2">
              {selectedPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                  <img src={post.image} alt={post.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{post.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ${
                        post.platform === "instagram" ? "badge-instagram" : post.platform === "tiktok" ? "badge-tiktok" : "badge-youtube"
                      }`}>
                        <PlatformIcon platform={post.platform} />
                        {post.platform}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        post.status === "borrador" ? "status-draft" : post.status === "listo" ? "status-ready" : "status-published"
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(post.scheduledDate).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
