import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { sapaData } from "~/assets/json-layers";
import type { Route } from "./+types/map";
import SearchBox from "./components/search";
import { useMap } from "./context/map-context";
import { useMapboxSearch } from "./hooks/use-mapbox-search";

export function meta({ location }: Route.MetaArgs) {
  return [
    { title: "Bản Đồ - NOVA Hotel" },
    { name: "description", content: "Khám phá địa điểm xung quanh khách sạn" },
  ];
}
export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { mapRef } = useMap();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const ecoPalmMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const search = useMapboxSearch();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_TOKEN;
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [103.844, 22.3402],
      zoom: 13,
      projection: "globe",
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("sapa", {
        type: "geojson",
        data: sapaData,
      });

      map.addLayer({
        id: "sapa-line",
        type: "line",
        source: "sapa",
        paint: {
          "line-color": "#0152cb",
          "line-width": 1.6,
        },
      });
      map.addControl(
        new mapboxgl.FullscreenControl({
          container: document.querySelector("body"),
        })
      );
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );
      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "bottom-left");
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: "imperial",
      });
      map.addControl(scale);

      scale.setUnit("metric");
      // Create custom Eco Palm marker
      const el = document.createElement("div");
      el.className = "eco-palm-marker";
      el.style.backgroundImage =
        "url('app/assets/img/26fcda3a6e3cbad9802ff0e1dc10d117.jpg')";
      el.style.width = "60px";
      el.style.height = "60px";
      el.style.backgroundSize = "100%";
      el.style.cursor = "pointer";
      el.style.borderRadius = "50%";
      el.style.border = "4px solid #0152cb";
      el.style.boxShadow = "0 4px 12px rgba(1, 82, 203, 0.4)";

      const ecoPalmPopup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false, // Cleaner look, user clicks map to close
        className: "flat-popup", // Custom class if you want to target arrow styling
      }).setHTML(`
        <div style="
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #ffffff;
          border: 1px solid #e2e8f0; /* Replaces shadow for definition */
          border-radius: 8px;
          max-width: 280px;
          overflow: hidden;
        ">
          <div style="padding: 16px 16px 12px 16px;">
            <div style="display: flex; align-items: start; gap: 8px;">
              <div style="
                background: #eff6ff; 
                color: #2563eb; 
                padding: 6px; 
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M10 2h4"/><path d="M9 22h6"/>
                </svg>
              </div>
              <div>
                <h3 style="
                  margin: 0;
                  font-size: 16px;
                  font-weight: 700;
                  color: #0f172a;
                  line-height: 1.2;
                ">
                  Eco Palm Resort
                </h3>
                <p style="
                  margin: 4px 0 0 0;
                  font-size: 12px;
                  color: #64748b;
                ">
                  Sa Pa, Lào Cai
                </p>
              </div>
            </div>
          </div>
      
          <div style="
            background-color: #f8fafc; 
            padding: 12px 16px;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style="font-size: 12px; color: #475569; font-family: monospace;">
                22.3147°N, 103.8830°E
              </span>
            </div>
      
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style="font-size: 12px; color: #475569; font-weight: 600;">
                Resort cao cấp
              </span>
            </div>
          </div>
      
          <div style="
            padding: 12px 16px; 
            display: grid; 
            grid-template-columns: 1fr 1.5fr; 
            gap: 8px;
          ">
            <button 
              onclick="window.open('https://www.google.com/maps/search/?api=1&query=Eco+Palm+Resort+Sapa', '_blank')"
              style="
                background: #ffffff;
                color: #334155;
                border: 1px solid #cbd5e1;
                padding: 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
                box-shadow: none; /* Explicitly removed */
              "
              onmouseover="this.style.background='#f1f5f9'"
              onmouseout="this.style.background='#ffffff'"
            >
              Chi tiết
            </button>
            
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=22.31465936205685,103.88300318155025', '_blank')"
              style="
                background: #2563eb;
                color: white;
                border: 1px solid #2563eb;
                padding: 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: background 0.2s;
                box-shadow: none; /* Explicitly removed */
              "
              onmouseover="this.style.background='#1d4ed8'; this.style.borderColor='#1d4ed8'"
              onmouseout="this.style.background='#2563eb'; this.style.borderColor='#2563eb'"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Dẫn đường
            </button>
          </div>
        </div>
      `);
      ecoPalmMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([103.88300318155025, 22.31465936205685])
        .setPopup(ecoPalmPopup)
        .addTo(map);

      map.on("mouseenter", "poi-label", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "poi-label", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [search]);

  return (
    <div className="h-screen w-screen relative" ref={mapContainerRef}>
      <SearchBox />
    </div>
  );
}
