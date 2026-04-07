"use client";

import { SparklesIcon } from "./Icons";

interface HeaderProps {
  onCreatePost: () => void;
}

export default function Header({ onCreatePost }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gold-shimmer flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--bg-primary)]">V</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gold-gradient">Viva Social Hub</h1>
            <p className="text-xs text-[var(--text-muted)]">Content Manager</p>
          </div>
        </div>

        <button
          onClick={onCreatePost}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-primary)] text-[var(--bg-primary)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--gold-primary)]/20 transition-all active:scale-95"
        >
          <SparklesIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Crear con AI</span>
        </button>
      </div>
    </header>
  );
}
