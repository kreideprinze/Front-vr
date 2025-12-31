import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "./CasualtyMap.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXl1c2gxMDIiLCJhIjoiY2xycTRtZW4xMDE0cTJtbno5dnU0dG12eCJ9.L9xmYztXX2yOahZoKDBr6g";

export default function CasualtyMap({
  casualties = [],
  focusedId = null,
  triageFilter = "all",
}) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markers = useRef({});

  /* =========================
     INIT MAP
  ========================= */

  useEffect(() => {
    if (map.current || !mapRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.1175, 28.7488],
      zoom: 16,
    });
  }, []);

  /* =========================
     CREATE MARKERS (ONCE)
  ========================= */

  useEffect(() => {
    if (!map.current) return;

    casualties.forEach(c => {
      if (markers.current[c.id]) return;

      const el = document.createElement("div");
      el.className = `casualty-marker triage-${c.triage}`;
      el.style.setProperty("--idColor", c.idColor);

      el.innerHTML = `
        <div class="waves">
          <span class="wave"></span>
          <span class="wave"></span>
        </div>

        <div class="dot">${c.id.replace("C", "")}</div>

        <div class="focus-arrows">
          <span class="arrow up"></span>
          <span class="arrow right"></span>
          <span class="arrow down"></span>
          <span class="arrow left"></span>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([c.lng, c.lat])
        .addTo(map.current);

      markers.current[c.id] = { marker, el };
    });
  }, [casualties]);

  /* =========================
     FILTER + FOCUS (HARD LOGIC)
  ========================= */

  useEffect(() => {
    if (!map.current) return;

    Object.entries(markers.current).forEach(([id, { el }]) => {
      el.classList.remove("focused", "hidden");

      const casualty = casualties.find(c => c.id === id);
      if (!casualty) return;

      /* 🔥 HARD TRIAGE FILTER */
      if (triageFilter !== "all" && casualty.triage !== triageFilter) {
        el.classList.add("hidden");
        return; // ⛔ stop all other logic
      }

      /* 🔍 FOCUS LOGIC */
      if (focusedId && id !== focusedId) {
        el.classList.add("hidden");
      }

      if (focusedId === id) {
        el.classList.add("focused");
      }
    });

    /* =========================
       CAMERA CONTROL
    ========================= */

    if (!focusedId) {
      map.current.flyTo({
        center: [77.1175, 28.7488],
        zoom: 16,
        speed: 1.1,
      });
      return;
    }

    const c = casualties.find(c => c.id === focusedId);
    if (!c) return;

    map.current.flyTo({
      center: [c.lng, c.lat],
      zoom: 19,
      speed: 0.9,
      curve: 1.3,
      essential: true,
    });
  }, [focusedId, triageFilter, casualties]);

  return <div ref={mapRef} className="map-container" />;
}
