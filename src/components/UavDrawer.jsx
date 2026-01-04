import { useState } from "react";
import "./UavDrawer.css";

export default function UavDrawer({
  uavs = [],
  collapsed = false,
  setCollapsed,
  focusedUavId,
  setFocusedUavId,
}) {
  const [confirmedId, setConfirmedId] = useState(null);

  const triggerConfirm = (id) => {
    setConfirmedId(id);
    setTimeout(() => setConfirmedId(null), 600);
  };

  return (
    <div className={`uav-drawer ${collapsed ? "collapsed" : ""}`}>
      {/* TOGGLE */}
      <button
        className="uav-drawer-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "‹" : "›"}
      </button>

      {/* LIST */}
      <div className="uav-list">
        {uavs.map((uav) => (
          <div
            key={uav.id}
            className={`uav-item
              ${focusedUavId === uav.id ? "focused" : ""}
              ${confirmedId === uav.id ? "confirmed" : ""}
            `}
            style={{ "--uavColor": uav.idColor }}
            onMouseEnter={() => setFocusedUavId(uav.id)}
            onMouseLeave={() => setFocusedUavId(null)}
          >
            {/* FULL ENERGY FILL */}
            <span className="uav-energy-fill" />

            {/* HEADER */}
            <div className="uav-header">
              <span className="uav-id">{uav.id}</span>
              <span className="uav-dot" />
            </div>

            {/* CONTROLS */}
            <div className="uav-controls">
              <button onClick={() => triggerConfirm(uav.id)}>ARM</button>
              <button onClick={() => triggerConfirm(uav.id)}>RTL</button>
              <button onClick={() => triggerConfirm(uav.id)}>LAND</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}