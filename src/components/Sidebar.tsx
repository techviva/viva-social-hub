"use client";

import { HomeIcon, CalendarIcon, LightbulbIcon, BarChartIcon, ScriptIcon } from "./Icons";

export type Section = "panel" | "calendario" | "ideas" | "guiones" | "metricas";

interface SidebarProps {
  active: Section;
  onChange: (s: Section) => void;
}

const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "panel", label: "Panel", icon: <HomeIcon className="w-5 h-5" /> },
  { key: "calendario", label: "Calendario", icon: <CalendarIcon className="w-5 h-5" /> },
  { key: "ideas", label: "Ideas", icon: <LightbulbIcon className="w-5 h-5" /> },
  { key: "guiones", label: "Guiones", icon: <ScriptIcon className="w-5 h-5" /> },
  { key: "metricas", label: "Metricas", icon: <BarChartIcon className="w-5 h-5" /> },
];

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-56 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex-shrink-0">
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === item.key
                  ? "bg-[var(--gold-primary)]/10 text-[var(--gold-light)] border border-[var(--border-gold)] shadow-sm shadow-[var(--gold-primary)]/5"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/50"
              }`}
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[48px] ${
                active === item.key
                  ? "text-[var(--gold-light)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.label}</span>
              {active === item.key && (
                <div className="w-1 h-1 rounded-full bg-[var(--gold-primary)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
