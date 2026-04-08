"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "./Icons";
import type { Platform } from "@/data/posts";

interface Idea {
  id: string;
  text: string;
  platform: Platform | "general";
  createdAt: string;
  color: string;
}

const COLORS = [
  "from-[#7ab82e]/20 to-[#3c4a30]/10",
  "from-[#6366f1]/20 to-[#4f46e5]/10",
  "from-[#e1306c]/20 to-[#c13584]/10",
  "from-[#00f2ea]/15 to-[#00c4cc]/10",
  "from-[#22c55e]/20 to-[#16a34a]/10",
  "from-[#ff4444]/15 to-[#cc3333]/10",
];

const STORAGE_KEY = "viva-social-hub-ideas";

function PlatformTag({ platform }: { platform: Idea["platform"] }) {
  if (platform === "general") return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--accent-leaf)]/10 text-[var(--viva-green-bright)] border border-[var(--border-accent)]">General</span>;
  const config = {
    instagram: { icon: <InstagramIcon className="w-3 h-3" />, cls: "badge-instagram" },
    tiktok: { icon: <TikTokIcon className="w-3 h-3" />, cls: "badge-tiktok" },
    youtube: { icon: <YouTubeIcon className="w-3 h-3" />, cls: "badge-youtube" },
  };
  const c = config[platform as keyof typeof config];
  return <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ${c.cls}`}>{c.icon}{platform}</span>;
}

export default function IdeasPanel() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [newPlatform, setNewPlatform] = useState<Idea["platform"]>("general");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setIdeas(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    }
  }, [ideas, loaded]);

  const addIdea = () => {
    const text = newIdea.trim();
    if (!text) return;
    const idea: Idea = {
      id: Date.now().toString(),
      text,
      platform: newPlatform,
      createdAt: new Date().toISOString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setIdeas([idea, ...ideas]);
    setNewIdea("");
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter((i) => i.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addIdea();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Ideas</h2>
        <p className="text-sm text-[var(--text-muted)]">Captura ideas rapidas para futuros contenidos</p>
      </div>

      {/* New Idea Input */}
      <div className="card-glass rounded-2xl p-5">
        <div className="space-y-3">
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu idea aqui... (Enter para guardar)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-leaf)] focus:ring-1 focus:ring-[var(--accent-leaf)]/30 transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(["general", "instagram", "tiktok", "youtube"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPlatform(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    newPlatform === p
                      ? p === "general"
                        ? "bg-[var(--accent-leaf)]/15 text-[var(--viva-green-bright)] border border-[var(--border-accent)]"
                        : p === "instagram"
                        ? "badge-instagram"
                        : p === "tiktok"
                        ? "badge-tiktok"
                        : "badge-youtube"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {p === "general" ? "General" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={addIdea}
              disabled={!newIdea.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--viva-green)] to-[var(--accent-leaf)] text-[var(--bg-primary)] font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--accent-leaf)]/20 transition-all active:scale-95"
            >
              <PlusIcon className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <p className="text-[var(--text-secondary)] font-medium">No hay ideas guardadas</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Empieza capturando tus ideas para contenido</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className={`group relative rounded-2xl p-4 border border-[var(--border-color)] bg-gradient-to-br ${idea.color} hover:border-[var(--border-accent)] transition-all`}
            >
              <button
                onClick={() => removeIdea(idea.id)}
                className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
              <p className="text-sm text-[var(--text-primary)] mb-3 pr-6 whitespace-pre-wrap">{idea.text}</p>
              <div className="flex items-center justify-between">
                <PlatformTag platform={idea.platform} />
                <span className="text-[10px] text-[var(--text-muted)]">
                  {new Date(idea.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
