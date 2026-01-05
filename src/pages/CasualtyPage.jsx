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

  return (
    <div className="casualty-page">

      {/* ================= MAP LAYER ================= */}
      <div className="map-layer">
        <CasualtyMap
          casualties={casualties}
          focusedId={focusedId}
          setFocusedId={setFocusedId}
          triageFilter={triageFilter}
          uavs={uavs}
          focusedUavId={focusedUavId}
        />
      </div>

      {/* ================= UI LAYER ================= */}
      <div className="ui-layer">

        <UavDrawer
          uavs={uavs}
          collapsed={uavCollapsed}
          setCollapsed={setUavCollapsed}
          focusedUavId={focusedUavId}
          setFocusedUavId={setFocusedUavId}
        />

        <div className={`right-ui ${collapsed ? "collapsed" : ""}`}>
          <div className="triage-filters">
            {["red", "yellow", "green", "black", "all"].map((t) => (
              <button
                key={t}
                className={`filter-btn ${t} ${triageFilter === t ? "active" : ""}`}
                onClick={() => setTriageFilter(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="drawer">
            <button className="drawer-toggle" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? "‹" : "›"}
            </button>

            <div className="casualty-list">
              {casualties
                .filter((c) => triageFilter === "all" || c.triage === triageFilter)
                .map((c) => {
                  const activeColor = c.idColor || "#ffffff";

                  return (
                    <button
                      key={c.id}
                      // ADDED: triage-${c.triage} class here to style the triangle via CSS
                      className={`casualty-btn triage-${c.triage} ${focusedId === c.id ? "active" : ""}`}
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