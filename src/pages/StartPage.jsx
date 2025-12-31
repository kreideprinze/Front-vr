import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import status from "../data/status.json";
import PixelTransition from "../components/PixelTransition";
import "./StartPage.css";

export default function StartPage() {
  const navigate = useNavigate();

  const gateOpen = status.gate === "1" || status.gate === "OPEN";
  const missionReady = status.mission_ready === true;

  const [overrideHeld, setOverrideHeld] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const down = (e) => e.key === "Shift" && setOverrideHeld(true);
    const up = (e) => e.key === "Shift" && setOverrideHeld(false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const canEnterNormally = gateOpen && missionReady;
  const canOverride = gateOpen && !missionReady && overrideHeld;
  const canEnter = canEnterNormally || canOverride;

  const handleEnter = () => {
    if (!canEnter) return;

    setTransitioning(true);

    // wait for animation to finish before routing
    setTimeout(() => {
      navigate("/casualty");
    }, 650);
  };

  return (
    <>
      <PixelTransition active={transitioning} />

      <div className="start-container">
        <img src="/logo.png" alt="Mission Logo" className="logo" />

        <h1>DTC – PHASE 3</h1>

        <div className="status-panel">
          <div>
            <span className="label">Gate:</span>
            <span className={`value ${gateOpen ? "open" : "closed"}`}>
              {status.gate}
            </span>
          </div>

          <div>
            <span className="label">Telemetry:</span>
            <span className="value">
              {status.telemetry_connected}
            </span>
          </div>

          <div>
            <span className="label">Mission Ready:</span>
            <span className={`value ${missionReady ? "open" : "closed"}`}>
              {missionReady ? "YES" : "NO"}
            </span>
          </div>
        </div>

        <button
          className={`enter-btn ${canOverride ? "override" : ""}`}
          disabled={!canEnter}
          onClick={handleEnter}
        >
          {canOverride ? "OVERRIDE" : "ENTER MISSION"}
        </button>

        {canOverride && (
          <div className="hint override-hint">
            OVERRIDE MODE ACTIVE
          </div>
        )}
      </div>
    </>
  );
}
