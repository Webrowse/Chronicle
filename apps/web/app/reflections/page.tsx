"use client";

import { BookOpen } from "lucide-react";

export default function Reflections() {
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
          <a href="/timeline" className="navItem">
            <span>⏱️</span> Timeline
          </a>
          <a href="/reflections" className="navItem active">
            <span>🍃</span> Reflections
          </a>
        </nav>
      </aside>

      <main className="mainContent">
        <div className="tasksSection">
          <div className="tasksHeader">
            <div>
              <h2>Reflections</h2>
              <p className="tasksDate">Look back on your days</p>
            </div>
          </div>
          <p style={{ color: "var(--muted)", marginTop: "24px" }}>
            Reflections view coming soon. This will help you review your mood, energy, and accomplishments over time.
          </p>
        </div>
      </main>
    </div>
  );
}
