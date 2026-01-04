import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import UavLayer from "./UavLayer";
import StatusPopup from "./StatusPopup";
import "./CasualtyMap.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYXl1c2gxMDIiLCJhIjoiY2xycTRtZW4xMDE0cTJtbno5dnU0dG12eCJ9.L9xmYztXX2yOahZoKDBr6g";

export default function CasualtyMap({
  casualties = [],
  focusedId = null,
  triageFilter = "all",
  uavs = [],
  focusedUavId = null,
}) {
  const mapRef = useRef(null);
  const mapRefInstance = useRef(null);
  const markers = useRef({});
  const [mapReady, setMapReady] = useState(false);

  // Helper to map triage text to HEX colors for the markers
  const triageColors = {
    red: "#ff4444",
    yellow: "#ffcc00",
    green: "#00ff88",
    black: "#333333"
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.1175, 28.7485],
      zoom: 17,
      pitch: 45,
    });

    map.on("load", () => {
      mapRefInstance.current = map;
      setMapReady(true);
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRefInstance.current;

    casualties.forEach((c) => {
      let entry = markers.current[c.id];
      const activeColor = triageColors[c.triage] || "#ffffff";

      if (!entry) {
        const el = document.createElement("div");
        el.className = `casualty-marker triage-${c.triage}`;
        
        el.innerHTML = `
          <div class="popup-anchor"></div>
          <div class="waves">
            <div class="wave w1"></div>
            <div class="wave w2"></div>
          </div>
          <div class="dot">${c.id.replace("C", "")}</div>
          <div class="focus-arrow"></div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([c.lng, c.lat])
          .addTo(map);

        markers.current[c.id] = { marker, el, anchor: el.querySelector(".popup-anchor") };
        entry = markers.current[c.id];
      }

      // Update the marker color to match the Triage level
      entry.el.style.setProperty("--idColor", activeColor);

      // Visibility and Layering
      const isVisible = triageFilter === "all" || c.triage === triageFilter;
      entry.el.style.display = isVisible ? "block" : "none";

      if (focusedId === c.id) {
        entry.el.classList.add("focused");
        entry.marker.getElement().style.zIndex = "999"; 
      } else {
        entry.el.classList.remove("focused");
        entry.marker.getElement().style.zIndex = "1";
      }
    });
  }, [casualties, mapReady, triageFilter, focusedId]);

  useEffect(() => {
    if (!mapReady || !focusedId) return;
    const casualty = casualties.find((c) => c.id === focusedId);
    if (casualty) {
      mapRefInstance.current.flyTo({
        center: [casualty.lng, casualty.lat],
        zoom: 19,
        speed: 1.2,
      });
    }
  }, [focusedId, mapReady, casualties]);

  return (
    <>
      <div ref={mapRef} className="map-container" />

      {focusedId && markers.current[focusedId] && createPortal(
        <StatusPopup c={casualties.find((cat) => cat.id === focusedId)} />,
        markers.current[focusedId].anchor
      )}

      {mapReady && (
        <UavLayer map={mapRefInstance.current} uavs={uavs} focusedUavId={focusedUavId} />
      )}
    </>
  );
}