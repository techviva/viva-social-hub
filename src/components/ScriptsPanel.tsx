"use client";

import { useState, useEffect } from "react";
import {
  SparklesIcon, PlusIcon, TrashIcon, CopyIcon, VideoIcon,
  ClockIcon, InstagramIcon, TikTokIcon, YouTubeIcon,
  ChevronRightIcon, XIcon, ScriptIcon,
} from "./Icons";

/* ── Types ── */

interface ScriptKeyPoint {
  point: string;
  script: string;
}

interface GeneratedScript {
  id: string;
  topic: string;
  title: string;
  hook: string;
  keyPoints: ScriptKeyPoint[];
  cta: string;
  duration: string;
  format: "reel" | "video_largo" | "historia";
  formatReason: string;
  tips: string[];
  platform: string;
  createdAt: string;
}

const STORAGE_KEY = "viva-social-hub-scripts";

/* ── Helpers ── */

function formatLabel(f: string) {
  if (f === "reel") return "Reel Corto";
  if (f === "video_largo") return "Video Largo";
  if (f === "historia") return "Historia";
  return f;
}

function formatBadgeClass(f: string) {
  if (f === "reel") return "badge-instagram";
  if (f === "video_largo") return "badge-youtube";
  return "badge-tiktok";
}

function PlatformLabel({ platform }: { platform: string }) {
  const lower = platform.toLowerCase();
  if (lower.includes("instagram") || lower.includes("ig"))
    return <span className="badge-instagram inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><InstagramIcon className="w-3 h-3" />Instagram</span>;
  if (lower.includes("tiktok") || lower.includes("tt"))
    return <span className="badge-tiktok inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><TikTokIcon className="w-3 h-3" />TikTok</span>;
  if (lower.includes("youtube") || lower.includes("yt"))
    return <span className="badge-youtube inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"><YouTubeIcon className="w-3 h-3" />YouTube</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--gold-primary)]/10 text-[var(--gold-light)] border border-[var(--border-gold)]">{platform}</span>;
}

/* ── Component ── */

export default function ScriptsPanel() {
  const [scripts, setScripts] = useState<GeneratedScript[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeScript, setActiveScript] = useState<GeneratedScript | null>(null);

  // generator form
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("cualquiera");
  const [duration, setDuration] = useState("auto");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setScripts(JSON.parse(saved)); } catch { /* ignore */ } }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  }, [scripts, loaded]);

  // Animated dots while generating
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(interval);
  }, [generating]);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), platform, duration, notes: notes.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar el guion");
        setGenerating(false);
        return;
      }

      const newScript: GeneratedScript = {
        id: `script-${Date.now()}`,
        topic: topic.trim(),
        ...data.script,
        platform,
        createdAt: new Date().toISOString(),
      };

      setScripts((prev) => [newScript, ...prev]);
      setActiveScript(newScript);
      setShowGenerator(false);
      setTopic("");
      setNotes("");
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteScript = (id: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
    if (activeScript?.id === id) setActiveScript(null);
  };

  const copyToClipboard = (script: GeneratedScript) => {
    const text = `${script.title}\n\n🎬 GANCHO:\n${script.hook}\n\n📋 PUNTOS CLAVE:\n${script.keyPoints.map((kp, i) => `${i + 1}. ${kp.point}\n${kp.script}`).join("\n\n")}\n\n📣 CIERRE:\n${script.cta}\n\n⏱ Duracion: ${script.duration}\n🎥 Formato: ${formatLabel(script.format)}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Guiones AI</h2>
          <p className="text-sm text-[var(--text-muted)]">Genera guiones completos para tus videos con inteligencia artificial</p>
        </div>
        <button
          onClick={() => { setShowGenerator(true); setActiveScript(null); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-95"
        >
          <SparklesIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Guion</span>
        </button>
      </div>

      {/* ── Generator Form ── */}
      {showGenerator && (
        <div className="animate-fade-up rounded-2xl border border-[var(--border-gold)] bg-gradient-to-br from-[var(--gold-primary)]/5 to-[var(--bg-card)] p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--gold-primary)]/10">
                <SparklesIcon className="w-5 h-5 text-[var(--gold-light)]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Generador de Guiones</h3>
                <p className="text-xs text-[var(--text-muted)]">Describe el tema y la AI creara tu guion</p>
              </div>
            </div>
            <button onClick={() => setShowGenerator(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Topic */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Tema del video *</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='Ej: "5 errores comunes al instalar turf sintetico" o "Before & after de un patio con pavers"'
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Platform */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Plataforma</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "cualquiera", label: "Cualquiera" },
                  { key: "Instagram", label: "Instagram" },
                  { key: "TikTok", label: "TikTok" },
                  { key: "YouTube", label: "YouTube" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPlatform(p.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      platform === p.key
                        ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-muted)]/30"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Duracion</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: "auto", label: "Auto" },
                  { key: "corto (< 60s)", label: "Corto" },
                  { key: "medio (1-3 min)", label: "Medio" },
                  { key: "largo (> 3 min)", label: "Largo" },
                ].map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDuration(d.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      duration === d.key
                        ? "bg-[var(--gold-primary)]/15 text-[var(--gold-light)] border border-[var(--border-gold)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-muted)]/30"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">Notas adicionales <span className="normal-case tracking-normal">(opcional)</span></label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: enfocarse en el ahorro de agua, mencionar la oferta de primavera..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold-primary)] focus:ring-1 focus:ring-[var(--gold-primary)]/30 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={!topic.trim() || generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--gold-primary)]/25 transition-all active:scale-[0.98]"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-[var(--bg-primary)]/30 border-t-[var(--bg-primary)] rounded-full animate-spin" />
                Generando guion{dots}
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Generar Guion con AI
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Active Script Detail ── */}
      {activeScript && !showGenerator && (
        <div className="animate-fade-up space-y-4">
          {/* Back + actions */}
          <div className="flex items-center justify-between">
            <button onClick={() => setActiveScript(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all flex items-center gap-1">
              <ChevronRightIcon className="w-3 h-3 rotate-180" />
              Volver a la biblioteca
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(activeScript)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--border-gold)] hover:text-[var(--gold-light)] transition-all"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button
                onClick={() => deleteScript(activeScript.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title + Meta */}
          <div className="rounded-2xl border border-[var(--border-gold)] bg-gradient-to-br from-[var(--gold-primary)]/5 to-[var(--bg-card)] p-5">
            <h3 className="text-lg font-bold text-gold-gradient mb-2">{activeScript.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <PlatformLabel platform={activeScript.platform} />
              <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ${formatBadgeClass(activeScript.format)}`}>
                <VideoIcon className="w-3 h-3" />
                {formatLabel(activeScript.format)}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                <ClockIcon className="w-3 h-3" />
                {activeScript.duration}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{activeScript.formatReason}</p>
          </div>

          {/* Hook */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--gold-primary)] flex items-center justify-center text-[11px] font-bold text-[var(--bg-primary)]">🎬</div>
              <h4 className="text-sm font-bold text-[var(--gold-light)]">Gancho Inicial</h4>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">&ldquo;{activeScript.hook}&rdquo;</p>
          </div>

          {/* Key Points */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-base">📋</span> Puntos Clave
            </h4>
            {activeScript.keyPoints.map((kp, i) => (
              <div key={i} className="animate-fade-up stagger rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/30 p-4" style={{ "--i": i } as React.CSSProperties}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--gold-primary)]/15 flex items-center justify-center text-[11px] font-bold text-[var(--gold-light)] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{kp.point}</p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{kp.script}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--gold-primary)] flex items-center justify-center text-[11px] font-bold text-[var(--bg-primary)]">📣</div>
              <h4 className="text-sm font-bold text-[var(--gold-light)]">Cierre & CTA</h4>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">{activeScript.cta}</p>
          </div>

          {/* Tips */}
          {activeScript.tips && activeScript.tips.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-5">
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="text-base">💡</span> Tips de Produccion
              </h4>
              <ul className="space-y-2">
                {activeScript.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-primary)] mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Script Library ── */}
      {!activeScript && !showGenerator && (
        <>
          {scripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gold-primary)]/10 to-[var(--bg-card)] border border-[var(--border-gold)] flex items-center justify-center mb-4">
                <ScriptIcon className="w-8 h-8 text-[var(--gold-light)]" />
              </div>
              <p className="text-[var(--text-secondary)] font-semibold text-base">Tu biblioteca esta vacia</p>
              <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">Genera tu primer guion con AI. Solo describe el tema del video y la inteligencia artificial hara el resto.</p>
              <button
                onClick={() => setShowGenerator(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-95"
              >
                <SparklesIcon className="w-4 h-4" />
                Crear Primer Guion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">{scripts.length} guion{scripts.length !== 1 ? "es" : ""} guardado{scripts.length !== 1 ? "s" : ""}</p>
              {scripts.map((script, idx) => (
                <button
                  key={script.id}
                  onClick={() => setActiveScript(script)}
                  className="animate-fade-up stagger w-full text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/40 p-4 hover:border-[var(--border-gold)] hover:shadow-lg hover:shadow-[var(--gold-primary)]/5 transition-all group"
                  style={{ "--i": idx } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold-light)] transition-colors truncate">{script.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">Tema: {script.topic}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <PlatformLabel platform={script.platform} />
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md ${formatBadgeClass(script.format)}`}>
                          <VideoIcon className="w-3 h-3" />
                          {formatLabel(script.format)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                          <ClockIcon className="w-3 h-3" />
                          {script.duration}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(script.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(script); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--gold-primary)]/10 text-[var(--text-muted)] hover:text-[var(--gold-light)] transition-all"
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                      </span>
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); deleteScript(script.id); }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-400/10 text-[var(--text-muted)] hover:text-red-400 transition-all"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--gold-light)] transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
