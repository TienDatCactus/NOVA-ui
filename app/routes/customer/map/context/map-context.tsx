import { createContext, useContext, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface MapContextType {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);

  return (
    <MapContext.Provider value={{ mapRef }}>{children}</MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be inside <MapProvider>");
  return ctx;
}
