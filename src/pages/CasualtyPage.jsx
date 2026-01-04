// src/pages/CasualtyPage.jsx

import { useState } from "react";
import casualties from "../data/casualty.json";
import uavs from "../data/uavs.json";

import CasualtyMap from "../components/CasualtyMap";
import UavDrawer from "../components/UavDrawer";

import "./CasualtyPage.css";

export default function CasualtyPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [triageFilter, setTriageFilter] = useState("all");
  const [focusedId, setFocusedId] = useState(null);

  const [uavCollapsed, setUavCollapsed] = useState(false);
  const [focusedUavId, setFocusedUavId] = useState(null);

  // 1. Centralized color mapping to match CasualtyMap.jsx
  const triageColors = {
    red: "#ff4444",
    yellow: "#ffcc00",
    green: "#00ff88",
    black: "#333333"
  };

  return (
    <div className="casualty-page">

      {/* ================= MAP LAYER ================= */}
      <div className="map-layer">
        <CasualtyMap
          casualties={casualties}
          focusedId={focusedId}
          triageFilter={triageFilter}
          uavs={uavs}
          focusedUavId={focusedUavId}
        />
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="ui-layer">

        {/* UAV DRAWER */}
        <UavDrawer
          uavs={uavs}
          collapsed={uavCollapsed}
          setCollapsed={setUavCollapsed}
          focusedUavId={focusedUavId}
          setFocusedUavId={setFocusedUavId}
        />

        {/* CASUALTY UI */}
        <div className={`right-ui ${collapsed ? "collapsed" : ""}`}>

          {/* FILTERS */}
          <div className="triage-filters">
            {["red", "yellow", "green", "black", "all"].map((t) => (
              <button
                key={t}
                className={`filter-btn ${t} ${
                  triageFilter === t ? "active" : ""
                }`}
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
                .filter(
                  (c) => triageFilter === "all" || c.triage === triageFilter
                )
                .map((c) => {
                  // 2. Derive the color from the triage status instead of c.idColor
                  const activeColor = triageColors[c.triage] || "#ffffff";

                  return (
                    <button
                      key={c.id}
                      className={`casualty-btn triage-${c.triage}`}
                      // 3. Apply the synchronized color to the CSS variable
                      style={{ "--idColor": activeColor }}
                      onMouseEnter={() => setFocusedId(c.id)}
                      onMouseLeave={() => setFocusedId(null)}
                    >
                      <span className="pixel-fill" />
                      <span className="label">{c.id}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}