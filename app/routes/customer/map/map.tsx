import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { sapaData, sapaPoiData } from "~/assets/json-layers";
import { detectPoiCategory, iconMap } from "~/lib/utils";
import type { Route } from "./+types/map";
import SearchBox from "./components/search";
import { useMap } from "./context/map-context";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { mapRef } = useMap();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState<number>(103.844);
  const [lat, setLat] = useState<number>(22.3402);
  const [zoom, setZoom] = useState<number>(13);
  const poiWithIcons = {
    ...sapaPoiData,
    features: sapaPoiData.features.map((f: any) => ({
      ...f,
      properties: {
        ...f.properties,
        icon_key: detectPoiCategory(f.properties),
      },
    })),
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_TOKEN;
    if (mapRef.current) return;
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    mapRef.current = map;
    map.on("load", () => {
      map.addSource("sapa", {
        type: "geojson",
        data: sapaData,
      });

      map.addSource("poi-source", {
        type: "geojson",
        data: poiWithIcons,
      });
      Object.values(iconMap).forEach((icon) => {
        if (map.hasImage(icon)) return;
        map.loadImage(`/icons/${icon}.png`, (err, img) => {
          if (err || !img) return;
          map.addImage(icon, img);
        });
      });
      map.addLayer({
        id: "poi-icons",
        type: "symbol",
        source: "poi-source",
        filter: ["==", ["geometry-type"], "Point"],
        layout: {
          "icon-image": [
            "coalesce",
            ["get", ["get", "icon_key"], ["literal", iconMap]],
            "icon-default",
          ],
          "icon-size": 0.8,
          "text-field": ["get", "name"],
          "text-offset": [0, 1.2],
          "text-size": 11,
          "text-anchor": "top",
        },
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

      // POI point
      map.addLayer({
        id: "poi-points",
        type: "circle",
        source: "poi-source",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 6,
          "circle-color": "#2563eb",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });

      // POI polygon
      map.addLayer({
        id: "poi-polygons",
        type: "fill",
        source: "poi-source",
        filter: [
          "in",
          ["geometry-type"],
          ["literal", ["Polygon", "MultiPolygon"]],
        ],
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
        },
      });

      // Click to show POI popup
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
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="relative ">
      <SearchBox className="z-20" />
      <div className="w-screen h-screen" ref={mapContainerRef} />;
    </div>
  );
}
