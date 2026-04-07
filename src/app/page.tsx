"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardPanel from "@/components/DashboardPanel";
import CalendarPanel from "@/components/CalendarPanel";
import IdeasPanel from "@/components/IdeasPanel";
import MetricsPanel from "@/components/MetricsPanel";
import type { Section } from "@/components/Sidebar";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("panel");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto">
            {activeSection === "panel" && <DashboardPanel />}
            {activeSection === "calendario" && <CalendarPanel />}
            {activeSection === "ideas" && <IdeasPanel />}
            {activeSection === "metricas" && <MetricsPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
