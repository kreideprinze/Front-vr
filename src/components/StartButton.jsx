import "./StartButton.css";

export default function StartButton({ enabled, override, onClick }) {
  return (
    <button
      className={`start-button 
        ${enabled ? "enabled" : "disabled"} 
        ${override ? "override" : ""}
      `}
      disabled={!enabled}
      onClick={onClick}
    >
      {override ? "OVERRIDE ENTRY" : "ENTER MISSION"}
    </button>
  );
}