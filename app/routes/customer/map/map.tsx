import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { sapaData } from "~/assets/json-layers";
import type { Route } from "./+types/map";
import SearchBox from "./components/search";
import { useMap } from "./context/map-context";
import { useMapboxSearch } from "./hooks/use-mapbox-search";

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
    });

    mapRef.current = map;

    map.on("load", () => {
      // Add Sapa boundary layer
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
      el.style.border = "3px solid #0152cb";
      el.style.boxShadow = "0 4px 12px rgba(1, 82, 203, 0.4)";

      const ecoPalmPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          padding: 12px;
          max-width: 280px;
          color: #374151;
        ">
          <div style="margin-bottom: 8px;">
            <h3 style="
              margin: 0 0 4px 0;
              font-size: 18px;
              font-weight: 700;
              color: #0152cb;
              line-height: 1.4;
            ">
              🏨 Eco Palm Resort
            </h3>
            <p style="
              margin: 0;
              font-size: 13px;
              color: #6b7280;
              line-height: 1.5;
            ">
              Sa Pa, Lào Cai, Việt Nam
            </p>
          </div>
          
          <div style="
            border-top: 1px solid #f3f4f6; 
            padding-top: 8px;
            margin-top: 8px;
          ">
            <div style="display: flex; align-items: center; font-size: 13px; margin-bottom: 6px;">
              <span style="margin-right: 8px;">📍</span>
              <span style="color: #4b5563;">22.3147°N, 103.8830°E</span>
            </div>
            <div style="display: flex; align-items: center; font-size: 13px;">
              <span style="margin-right: 8px;">⭐</span>
              <span style="color: #4b5563; font-weight: 600;">Resort cao cấp</span>
            </div>
          </div>

          <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button 
              onclick="window.open('https://www.google.com/maps/search/?api=1&query=Eco+Palm+Resort+Sapa', '_blank')"
              style="
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #e5e7eb;
                padding: 8px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
              "
              onmouseover="this.style.background='#e5e7eb'"
              onmouseout="this.style.background='#f3f4f6'"
            >
              Chi tiết
            </button>
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=22.31465936205685,103.88300318155025', '_blank')"
              style="
                background: #0152cb;
                color: white;
                border: none;
                padding: 8px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                box-shadow: 0 2px 4px rgba(1, 82, 203, 0.3);
              "
              onmouseover="this.style.background='#013d9a'"
              onmouseout="this.style.background='#0152cb'"
            >
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
    <div className="relative">
      <SearchBox />
      <div className="w-screen h-screen" ref={mapContainerRef} />
    </div>
  );
}
