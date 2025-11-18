import "mapbox-gl/dist/mapbox-gl.css";
import type { Route } from "./+types/map";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_TOKEN;
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [lng, setLng] = useState<number>(103.844);
  const [lat, setLat] = useState<number>(22.3402);
  const [zoom, setZoom] = useState<number>(13);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    mapRef.current = map;

    map.on("move", () => {
      if (mapRef.current) {
        setLng(parseFloat(mapRef.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(mapRef.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(mapRef.current.getZoom().toFixed(2)));
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lng, lat, zoom]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full " />
    </>
  );
}
