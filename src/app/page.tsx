"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardPanel from "@/components/DashboardPanel";
import CalendarPanel from "@/components/CalendarPanel";
import DraftsPanel from "@/components/DraftsPanel";
import IdeasPanel from "@/components/IdeasPanel";
import ScriptsPanel from "@/components/ScriptsPanel";
import CarouselPanel from "@/components/CarouselPanel";
import MetricsPanel from "@/components/MetricsPanel";
import AIPostCreator, { type DraftPost, loadDrafts, saveDrafts } from "@/components/AIPostCreator";
import type { Section } from "@/components/Sidebar";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("panel");
  const [showAICreator, setShowAICreator] = useState(false);
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const isCalendar = activeSection === "calendario";

  // Load drafts from localStorage
  useEffect(() => {
    setDrafts(loadDrafts());
    setLoaded(true);
  }, []);

  // Persist drafts
  useEffect(() => {
    if (loaded) saveDrafts(drafts);
  }, [drafts, loaded]);

  const handleSaveDraft = useCallback((draft: DraftPost) => {
    setDrafts((prev) => [draft, ...prev]);
  }, []);

  const handleDeleteDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleScheduleDraft = useCallback((draft: DraftPost) => {
    // Remove from drafts (it's now scheduled)
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    // Navigate to calendar
    setActiveSection("calendario");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onCreatePost={() => setShowAICreator(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <main className={`flex-1 overflow-hidden flex flex-col ${isCalendar ? "" : "overflow-y-auto"}`}>
          <div className={isCalendar ? "flex-1 flex flex-col overflow-hidden px-0 py-0" : "max-w-6xl mx-auto w-full px-4 md:px-8 py-6 pb-24 md:pb-6"}>
            {activeSection === "panel" && <DashboardPanel />}
            {isCalendar && <CalendarPanel />}
            {activeSection === "borradores" && (
              <DraftsPanel
                drafts={drafts}
                onDelete={handleDeleteDraft}
                onSchedule={handleScheduleDraft}
              />
            )}
            {activeSection === "ideas" && <IdeasPanel />}
            {activeSection === "guiones" && <ScriptsPanel />}
            {activeSection === "carruseles" && <CarouselPanel />}
            {activeSection === "metricas" && <MetricsPanel />}
          </div>
        </main>
      </div>

      <AIPostCreator
        open={showAICreator}
        onClose={() => setShowAICreator(false)}
        onSaveDraft={handleSaveDraft}
        onSchedule={handleScheduleDraft}
      />
    </div>
  );
}
