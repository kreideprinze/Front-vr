import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "./UavLayer.css";

export default function UavLayer({ map, uavs = [] }) {
  const markers = useRef({});
  

  useEffect(() => {
    if (!map) return;

    uavs.forEach((uav) => {
      let entry = markers.current[uav.id];

      if (!entry) {
        const el = document.createElement("div");
        el.className = "uav-marker";
        el.style.setProperty("--uavColor", uav.idColor || "#00ffff");

        el.innerHTML = `
  <div class="uav-rotator">
    <div class="heading-cone"></div>

    <div class="uav-arm h"></div>
    <div class="uav-arm v"></div>

    <div class="uav-motor tl"></div>
    <div class="uav-motor tr"></div>
    <div class="uav-motor bl"></div>
    <div class="uav-motor br"></div>

    <div class="uav-body"></div>
  </div>
`;


        const marker = new mapboxgl.Marker(el)
          .setLngLat([uav.lng, uav.lat])
          .addTo(map);

        markers.current[uav.id] = { marker, el };
        entry = markers.current[uav.id];
      }

      /* === UPDATE POSITION === */
      entry.marker.setLngLat([uav.lng, uav.lat]);

      /* === UPDATE HEADING === */
      const yaw = uav.yaw ?? 0;
const rotator = entry.el.querySelector(".uav-rotator");

if (rotator) {
  rotator.style.transform = `rotate(${yaw}deg)`;
}

    });
  }, [map, uavs]);

  return null;
}