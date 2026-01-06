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
  pitch: 0 // Changed from 45 to 0 for Top View
};

const ESRI_URLS = {
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export default function CasualtyMap({
  casualties = [],
  focusedId = null,
  setFocusedId, 
  triageFilter = "all",
  uavs = [],
  focusedUavId = null,
  isSidebarCollapsed = false
}) {
  const mapRef = useRef(null);
  const mapRefInstance = useRef(null);
  const markers = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [mapStyle, setMapStyle] = useState("dark");

useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      ...DEFAULT_VIEW,
      maxZoom: 18,     // Add this line to prevent zooming into the "white zone"
      dragRotate: false,
      touchZoomRotate: false
    });

    map.on("load", () => {
      mapRefInstance.current = map;
      setMapReady(true);
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRefInstance.current) return;
    const map = mapRefInstance.current;
    const layerId = "esri-layer";
    const sourceId = "esri-source";

    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);

    if (mapStyle === "satellite") {
      map.addSource(sourceId, {
        type: "raster",
        tiles: [ESRI_URLS.satellite],
        tileSize: 256,
      });

      map.addLayer({
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: { "raster-fade-duration": 400 }
      }, "road-label-simple"); 
    }
  }, [mapStyle, mapReady]);

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
      entry.el.style.display = (triageFilter === "all" || c.triage === triageFilter) ? "block" : "none";

      if (focusedId === c.id || hoveredId === c.id) {
        entry.el.classList.add("focused");
        entry.marker.getElement().style.zIndex = "999"; 
      } else {
        entry.el.classList.remove("focused");
        entry.marker.getElement().style.zIndex = "1";
      }
    });
  }, [casualties, mapReady, triageFilter, focusedId, hoveredId]);

// Updated Focus/FlyTo Logic to prevent ESRI white-screen
  useEffect(() => {
    if (!mapReady || !mapRefInstance.current) return;

    if (focusedId) {
      const casualty = casualties.find((c) => c.id === focusedId);
      if (casualty) {
        // ESRI usually breaks after zoom 18. Mapbox Dark works fine at 19+.
        const maxSafeZoom = mapStyle === "satellite" ? 18 : 19;

        mapRefInstance.current.flyTo({
          center: [casualty.lng, casualty.lat],
          zoom: maxSafeZoom, 
          pitch: 0, 
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
  }, [focusedId, mapReady, casualties, mapStyle]); // Added mapStyle to dependencies

  const displayId = hoveredId || focusedId;

  return (
    <>
      <div ref={mapRef} className="map-container" />

      {/* Dropdown positioned next to the filters box */}
      <div className={`map-style-overlay ${isSidebarCollapsed ? "sidebar-collapsed" : "sidebar-open"}`}>
        <select 
          className="style-select"
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
        >
          <option value="dark">Dark Map</option>
          <option value="satellite">Satellite</option>
        </select>
      </div>

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