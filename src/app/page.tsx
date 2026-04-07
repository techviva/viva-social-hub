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
  const isCalendar = activeSection === "calendario";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <main className={`flex-1 overflow-hidden flex flex-col ${isCalendar ? "" : "overflow-y-auto"}`}>
          <div className={isCalendar ? "flex-1 flex flex-col overflow-hidden px-0 py-0" : "max-w-6xl mx-auto w-full px-4 md:px-8 py-6 pb-24 md:pb-6"}>
            {activeSection === "panel" && <DashboardPanel />}
            {isCalendar && <CalendarPanel />}
            {activeSection === "ideas" && <IdeasPanel />}
            {activeSection === "metricas" && <MetricsPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
