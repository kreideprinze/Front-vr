import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import UavLayer from "./UavLayer";
import StatusPopup from "./StatusPopup";
import "./CasualtyMap.css";

mapboxgl.accessToken = "pk.eyJ1IjoiYXl1c2gxMDIiLCJhIjoiY2xycTRtZW4xMDE0cTJtbno5dnU0dG12eCJ9.L9xmYztXX2yOahZoKDBr6g";

const DEFAULT_VIEW = {
  center: [77.1175, 28.7485],
  zoom: 17,
  pitch: 45
};

export default function CasualtyMap({
  casualties = [],
  focusedId = null,
  setFocusedId, 
  triageFilter = "all",
  uavs = [],
  focusedUavId = null,
}) {
  const mapRef = useRef(null);
  const mapRefInstance = useRef(null);
  const markers = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      ...DEFAULT_VIEW,
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

    const incomingIds = new Set(casualties.map(c => c.id));
    Object.keys(markers.current).forEach(id => {
      if (!incomingIds.has(id)) {
        markers.current[id].marker.remove();
        delete markers.current[id];
      }
    });

    casualties.forEach((c) => {
      let entry = markers.current[c.id];
      
      // Main branch uses the ID-based color from the data object
      const activeColor = c.idColor || "#ffffff";

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

        el.addEventListener('mouseenter', () => setHoveredId(c.id));
        el.addEventListener('mouseleave', () => setHoveredId(null));
        el.addEventListener('click', () => setFocusedId(c.id));

        const marker = new mapboxgl.Marker(el).setLngLat([c.lng, c.lat]).addTo(map);
        markers.current[c.id] = { marker, el, anchor: el.querySelector(".popup-anchor") };
        entry = markers.current[c.id];
      }

      entry.marker.setLngLat([c.lng, c.lat]);
      entry.el.style.setProperty("--idColor", activeColor);
      
      const isVisible = triageFilter === "all" || c.triage === triageFilter;
      entry.el.style.display = isVisible ? "block" : "none";

      if (focusedId === c.id || hoveredId === c.id) {
        entry.el.classList.add("focused");
        entry.marker.getElement().style.zIndex = "999"; 
      } else {
        entry.el.classList.remove("focused");
        entry.marker.getElement().style.zIndex = "1";
      }
    });
  }, [casualties, mapReady, triageFilter, focusedId, hoveredId]);

  useEffect(() => {
    if (!mapReady || !mapRefInstance.current) return;

    if (focusedId) {
      const casualty = casualties.find((c) => c.id === focusedId);
      if (casualty) {
        mapRefInstance.current.flyTo({
          center: [casualty.lng, casualty.lat],
          zoom: 19,
          speed: 1.2,
          essential: true
        });
      }
    } else {
      mapRefInstance.current.flyTo({
        ...DEFAULT_VIEW,
        speed: 1.0,
        essential: true
      });
    }
  }, [focusedId, mapReady, casualties]);

  const displayId = hoveredId || focusedId;

  return (
    <>
      <div ref={mapRef} className="map-container" />
      {displayId && markers.current[displayId] && createPortal(
        <StatusPopup c={casualties.find((cat) => cat.id === displayId)} />,
        markers.current[displayId].anchor
      )}
      {mapReady && (
        <UavLayer map={mapRefInstance.current} uavs={uavs} focusedUavId={focusedUavId} />
      )}
    </>
  );
}