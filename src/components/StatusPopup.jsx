import "./StatusPopup.css";

export default function StatusPopup({ c }) {
  if (!c) return null;

  const triageColors = {
    red: "#ff4444",
    yellow: "#ffcc00",
    green: "#00ff88",
    black: "#ffffff"
  };

  const isHrAbnormal = c.hr > 100 || (c.hr < 60 && c.hr !== 0);
  const isRrAbnormal = c.rr > 20 || (c.rr < 12 && c.rr !== 0);

  return (
    <div className="status-popup-wrapper">
      <div className="status-box">
        <div className="status-coords">{c.lat.toFixed(6)}, {c.lng.toFixed(6)}</div>
        
        <div className="status-header">
          <div className="status-id-badge" style={{ backgroundColor: triageColors[c.triage] }}>{c.id}</div>
          <div className="status-triage-text" style={{ color: triageColors[c.triage] }}>
            {c.triage === 'red' ? 'SEVERE (IMMEDIATE)' : c.triage.toUpperCase()}
          </div>
        </div>

        <div className="vitals-row">
          <div className={`vital-card ${isHrAbnormal ? 'warning' : ''}`}>
            <span className="lab">HR</span>
            <span className="val">{c.hr} <small>BPM</small></span>
          </div>
          <div className={`vital-card ${isRrAbnormal ? 'warning' : ''}`}>
            <span className="lab">RR</span>
            <span className="val">{c.rr} <small>BrPM</small></span>
          </div>
        </div>

        <div className="status-section">
          <div className="section-title">CRITICAL ALERTS</div>
          <div className="status-grid">
            {/* Value "Present" turns red, not the label HEM */}
            <span>HEM: <strong className={c.hem === 'Present' ? 'warning-text' : ''}>{c.hem}</strong></span>
            <span>RD: <strong className={c.resp_distress === 'Present' ? 'warning-text' : ''}>{c.resp_distress}</strong></span>
          </div>
        </div>

        <div className="status-section">
          <div className="section-title">GCS / ALERTNESS</div>
          <div className="status-grid gcs">
            <span>OCU: <strong className={c.ocular === 'Closed' ? 'warning-text' : ''}>{c.ocular}</strong></span>
            <span>VRB: <strong className={c.verbal === 'Abnormal' || c.verbal === 'Absent' ? 'warning-text' : ''}>{c.verbal}</strong></span>
            <span>MTR: <strong className={c.motor === 'Abnormal' || c.motor === 'Absent' ? 'warning-text' : ''}>{c.motor}</strong></span>
          </div>
        </div>

        <div className="status-section">
          <div className="section-title">TRAUMA ASSESSMENT</div>
          <div className="status-grid trauma">
            <span>HEAD: <strong className={c.trauma_head !== 'Normal' ? 'warning-text' : ''}>{c.trauma_head}</strong></span>
            <span>TORSO: <strong className={c.trauma_torso !== 'Normal' ? 'warning-text' : ''}>{c.trauma_torso}</strong></span>
            <span>UPPER: <strong className={c.trauma_upper !== 'Normal' ? 'warning-text' : ''}>{c.trauma_upper}</strong></span>
            <span>LOWER: <strong className={c.trauma_lower !== 'Normal' ? 'warning-text' : ''}>{c.trauma_lower}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}