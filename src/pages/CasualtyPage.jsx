// src/pages/CasualtyPage.jsx

import { useState } from "react";
import casualties from "../data/casualty.json";
import CasualtyMap from "../components/CasualtyMap";
import "./CasualtyPage.css";

export default function CasualtyPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [triageFilter, setTriageFilter] = useState("all");
  const [focusedId, setFocusedId] = useState(null);

  return (
    <div className="casualty-page">

      {/* MAP */}
      <CasualtyMap
        casualties={casualties}
        focusedId={focusedId}
        triageFilter={triageFilter}
      />

      {/* UI OVERLAY */}
      <div className={`right-ui ${collapsed ? "collapsed" : ""}`}>

        {/* FILTERS */}
        <div className="triage-filters">
          {["red", "yellow", "green", "black", "all"].map(t => (
            <button
              key={t}
              className={`filter-btn ${t} ${triageFilter === t ? "active" : ""}`}
              onClick={() => setTriageFilter(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* DRAWER */}
        <div className="drawer">
          <button
            className="drawer-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "‹" : "›"}
          </button>

          {/* CASUALTY LIST */}
          <div className="casualty-list">
            {casualties
              .filter(c => triageFilter === "all" || c.triage === triageFilter)
              .map(c => (
                <button
  key={c.id}
  className={`casualty-btn triage-${c.triage}`}
  style={{ "--idColor": c.idColor }}
  onMouseEnter={() => setFocusedId(c.id)}
  onMouseLeave={() => setFocusedId(null)}
>
  {/* BACKGROUND FILL */}
  <span className="pixel-fill" />

  {/* FOREGROUND TEXT */}
  <span className="label">{c.id}</span>
</button>

              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
