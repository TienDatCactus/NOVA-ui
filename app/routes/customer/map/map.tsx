import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { sapaData } from "~/assets/json-layers";
import type { Route } from "./+types/map";
import SearchBox from "./components/search";
import { useMap } from "./context/map-context";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { mapRef } = useMap();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState<number>(103.844);
  const [lat, setLat] = useState<number>(22.3402);
  const [zoom, setZoom] = useState<number>(13);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_TOKEN;

    // Don't initialize if already initialized or container not ready
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [lng, lat],
      zoom: zoom,
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

      function handlePOIClick(e: any) {
        const feature = e.features?.[0];
        if (!feature) return;
      }

      map.on("click", "poi-points", handlePOIClick);
      map.on("click", "poi-polygons", handlePOIClick);
    });

    map.on("move", () => {
      if (mapRef.current) {
        setLng(parseFloat(mapRef.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(mapRef.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(mapRef.current.getZoom().toFixed(2)));
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative ">
      <SearchBox />
      <div className="w-screen h-screen" ref={mapContainerRef} />
    </div>
  );
}
