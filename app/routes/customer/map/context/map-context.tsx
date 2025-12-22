import { createContext, useContext, useRef } from "react";

interface MapContextType {
  mapRef: React.RefObject<mapboxgl.Map | null>;
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
