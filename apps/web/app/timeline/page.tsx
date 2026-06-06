"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Timeline() {
  return (
    <div className="appShell">
      <aside className="sidebarLeft">
        <div className="brand">
          <span className="brandIcon"><BookOpen size={18} /></span>
          <span>Chronicle</span>
        </div>
        <nav className="nav">
          <a href="/" className="navItem">
            <span>☀️</span> Today
          </a>
          <a href="/timeline" className="navItem active">
            <span>⏱️</span> Timeline
          </a>
          <a href="/reflections" className="navItem">
            <span>🍃</span> Reflections
          </a>
        </nav>
      </aside>

      <main className="mainContent">
        <div className="tasksSection">
          <div className="tasksHeader">
            <div>
              <h2>Timeline</h2>
              <p className="tasksDate">View your tasks over time</p>
            </div>
          </div>
          <p style={{ color: "var(--muted)", marginTop: "24px" }}>
            Timeline view coming soon. This will show your tasks and journal entries across multiple days in a chronological view.
          </p>
        </div>
      </main>
    </div>
  );
}
